/**
 * Port Interface - Defines contract for storage operations (S3)
 */
export interface IStorageClient {
  /**
   * Upload a file to storage
   */
  upload(key: string, buffer: Buffer, contentType: string): Promise<void>;

  /**
   * Download a file from storage
   */
  download(key: string): Promise<string>;

  /**
   * Delete a file from storage
   */
  delete(key: string): Promise<void>;

  /**
   * Check if a file exists in storage
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get the URI for a storage object
   */
  getUri(key: string): string;
}
