import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { IFileStorageService } from '../../domain/services/file-storage.service.interface';

@Injectable()
export class S3FileStorageService implements IFileStorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('aws.region');
    const endpointUrl = this.configService.get<string>('aws.endpointUrl');
    const profile = this.configService.get<string>('aws.profile');
    const accessKeyId = this.configService.get<string>(
      'aws.credentials.accessKeyId',
    );
    const secretAccessKey = this.configService.get<string>(
      'aws.credentials.secretAccessKey',
    );

    this.s3Client = new S3Client({
      region,
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

    this.bucketName =
      this.configService.get<string>('aws.s3.bucketName') || 'terms';
  }

  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const endpointUrl = this.configService.get<string>('aws.endpointUrl');
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        // LocalStack pode não suportar ACL; omitir quando usar endpoint custom
        ...(endpointUrl ? {} : { ACL: 'public-read' }),
      }),
    );

    if (endpointUrl) {
      const publicUrl =
        this.configService.get<string>('aws.s3.publicUrl') || endpointUrl;
      return `${publicUrl.replace(/\/$/, '')}/${this.bucketName}/${key}`;
    }
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }
}
