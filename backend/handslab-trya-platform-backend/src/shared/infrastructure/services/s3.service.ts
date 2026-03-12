import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const awsConfig = this.configService.get('aws');

    // Validate required AWS configuration
    if (!awsConfig.region) {
      throw new Error('AWS_REGION environment variable is required');
    }

    if (!awsConfig.s3.bucketName) {
      throw new Error('AWS_S3_BUCKET_NAME environment variable is required');
    }

    // Create S3 client configuration
    const s3Config: any = {
      region: awsConfig.region,
    };

    // Use explicit credentials if provided, otherwise use default credential chain (SSO, profile, etc.)
    if (
      awsConfig.credentials.accessKeyId &&
      awsConfig.credentials.secretAccessKey
    ) {
      s3Config.credentials = {
        accessKeyId: awsConfig.credentials.accessKeyId,
        secretAccessKey: awsConfig.credentials.secretAccessKey,
      };
    }
    // If AWS_PROFILE is set, the SDK will automatically use it from the default credential chain

    this.s3Client = new S3Client(s3Config);
    this.bucketName = awsConfig.s3.bucketName;
  }

  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600, // 1 hour
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  getPublicUrl(key: string): string {
    const region = this.configService.get('aws.region');
    return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
  }

  async generatePresignedViewUrl(
    key: string,
    expiresIn: number = 3600, // 1 hour
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  generateProfilePictureKey(userId: string, fileExtension: string): string {
    const timestamp = Date.now();
    return `profile-pictures/${userId}/${timestamp}.${fileExtension}`;
  }

  /**
   * Upload file to S3
   */
  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await this.s3Client.send(command);
    return this.getPublicUrl(key);
  }

  /**
   * Download file from S3
   */
  async downloadFile(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    const chunks: Uint8Array[] = [];

    if (response.Body) {
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
    }

    return Buffer.concat(chunks);
  }

  /**
   * Generate key for import file
   */
  generateImportFileKey(importId: string, filename: string): string {
    const timestamp = Date.now();
    const extension = filename.split('.').pop() || 'csv';
    return `network-providers/imports/${importId}/${timestamp}.${extension}`;
  }
}
