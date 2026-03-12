import { Injectable, Inject } from '@nestjs/common';
import type { IFileProcessor } from '../../domain/ports/file-processor.interface';
import type { IPdfConverter } from '../../domain/ports/pdf-converter.interface';
import { PDF_CONVERTER_TOKEN } from '../../domain/ports/pdf-converter.interface';
import { ImagePayload } from '../../domain/entities/image-payload';
import { InvalidFileTypeError } from '../../domain/errors/invalid-file-type.error';

@Injectable()
export class FileProcessorService implements IFileProcessor {
  constructor(
    @Inject(PDF_CONVERTER_TOKEN)
    private readonly pdfConverter: IPdfConverter,
  ) {}

  async processFiles(
    files: Array<{ data: string; type: string; name: string }>,
  ): Promise<ImagePayload[]> {
    const images: ImagePayload[] = [];

    for (const file of files) {
      if (file.type === 'application/pdf') {
        try {
          const pdfImages = await this.pdfConverter.convertToImages(file.data);
          images.push(...pdfImages);
        } catch (error) {
          console.error(`❌ Error converting PDF ${file.name}:`, error);
          throw new Error(
            `Failed to convert PDF ${file.name}: ${error.message}`,
          );
        }
      } else if (file.type.startsWith('image/')) {
        images.push({
          data: file.data,
          media_type: file.type,
          original_name: file.name,
        });
      } else {
        throw new InvalidFileTypeError(`Unsupported file type: ${file.type}`);
      }
    }

    return images;
  }
}
