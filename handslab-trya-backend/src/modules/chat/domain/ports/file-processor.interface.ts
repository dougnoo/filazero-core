import { ImagePayload } from '../entities/image-payload';

export interface IFileProcessor {
  processFiles(
    files: Array<{ data: string; type: string; name: string }>,
  ): Promise<ImagePayload[]>;
}

export const FILE_PROCESSOR_TOKEN = 'FILE_PROCESSOR_TOKEN';
