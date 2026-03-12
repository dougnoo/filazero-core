export interface IFileStorageService {
  uploadFile(key: string, buffer: Buffer, contentType: string): Promise<string>;
}

export const FILE_STORAGE_SERVICE_TOKEN = 'FILE_STORAGE_SERVICE_TOKEN';
