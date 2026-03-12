import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { uuidv7 } from 'uuidv7';

export interface UploadResult {
  s3Key: string;
  fileUrl: string;
}

@Injectable()
export class DocumentStorageService {
  private readonly logger = new Logger(DocumentStorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>(
      'aws.s3.bucketRegion',
      'us-east-1',
    );
    this.bucketName = this.configService.get<string>('aws.s3.bucketName')!;

    const profile = this.configService.get<string>('aws.profile');
    const accessKeyId = this.configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'aws.credentials.secretAccessKey',
    );
    const endpointUrl = this.configService.get<string>('aws.endpointUrl');

    this.s3Client = new S3Client({
      region: this.region,
      ...(endpointUrl
        ? {
            endpoint: endpointUrl,
            forcePathStyle: true,
            credentials: {
              accessKeyId: accessKeyId || 'test',
              secretAccessKey: secretAccessKey || 'test',
            },
          }
        : {
            ...(profile ? { profile } : {}),
            ...(accessKeyId && secretAccessKey
              ? { credentials: { accessKeyId, secretAccessKey } }
              : {}),
          }),
    });
  }

  async upload(
    file: Buffer,
    originalFileName: string,
    mimeType: string,
    tenantId: string,
    ownerUserId: string,
    memberUserId: string,
  ): Promise<UploadResult> {
    const sanitizedFileName = this.sanitizeFileName(originalFileName);
    const fileId = uuidv7();
    const s3Key = `medical-documents/${tenantId}/${ownerUserId}/${memberUserId}/${fileId}-${sanitizedFileName}`;

    this.logger.log(`Uploading document to S3: ${s3Key}`);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      Body: file,
      ContentType: mimeType,
    });

    await this.s3Client.send(command);
    this.logger.log(`Upload concluído: ${s3Key}`);

    const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${s3Key}`;

    return { s3Key, fileUrl };
  }

  async delete(s3Key: string): Promise<void> {
    this.logger.log(`Deletando arquivo do S3: ${s3Key}`);

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    await this.s3Client.send(command);
    this.logger.log(`Arquivo deletado: ${s3Key}`);
  }

  async generatePresignedUrl(
    s3Key: string,
    expiresIn: number = 300,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async generateDownloadUrl(
    s3Key: string,
    fileName: string,
    expiresIn: number = 300,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  }
}
