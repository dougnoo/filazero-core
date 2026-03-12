import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client as AWSS3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { IStorageClient } from '../domain/interfaces/storage-client.interface';

/**
 * Infrastructure Adapter - S3 Storage Implementation
 * Implements IStorageClient interface using AWS SDK
 */
@Injectable()
export class S3StorageAdapter implements IStorageClient {
  private readonly logger = new Logger(S3StorageAdapter.name);
  private readonly client: AWSS3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const runtime = this.configService.get<string>('AWS_RUNTIME', 'aws');
    this.bucketName = this.configService.get<string>('TRANSCRIBE_BUCKET_NAME', 'bedrock-chat-transcribe');

    const config = { region };
    this.client = new AWSS3Client(config);

    this.logger.log(`S3 Storage initialized: bucket=${this.bucketName}, region=${region}, runtime=${runtime}`);
  }

  async upload(key: string, buffer: Buffer, contentType: string): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      await this.client.send(command);
      this.logger.log(`📤 File uploaded to S3: s3://${this.bucketName}/${key}`);
    } catch (error) {
      this.logger.error(`❌ Failed to upload to S3: ${key}`, error);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  async download(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.client.send(command);
      const body = await response.Body!.transformToString();
      
      this.logger.log(`📥 File downloaded from S3: s3://${this.bucketName}/${key}`);
      return body;
    } catch (error) {
      this.logger.error(`❌ Failed to download from S3: ${key}`, error);
      throw new Error(`S3 download failed: ${error.message}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);
      this.logger.log(`🗑️ File deleted from S3: s3://${this.bucketName}/${key}`);
    } catch (error) {
      this.logger.warn(`⚠️ Failed to delete from S3: ${key}`, error.message);
      // Don't throw on cleanup failures
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw new Error(`S3 exists check failed: ${error.message}`);
    }
  }

  getUri(key: string): string {
    return `s3://${this.bucketName}/${key}`;
  }
}
