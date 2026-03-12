import { ImagePayload } from '../entities/image-payload';

export interface IPdfConverter {
  convertToImages(base64Pdf: string): Promise<ImagePayload[]>;
}

export const PDF_CONVERTER_TOKEN = 'PDF_CONVERTER_TOKEN';
