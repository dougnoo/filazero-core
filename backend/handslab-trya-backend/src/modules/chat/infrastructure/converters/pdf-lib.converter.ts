import { Injectable } from '@nestjs/common';
import type { IPdfConverter } from '../../domain/ports/pdf-converter.interface';
import { ImagePayload } from '../../domain/entities/image-payload';
import { createCanvas } from '@napi-rs/canvas';

@Injectable()
export class PdfLibConverter implements IPdfConverter {
  private pdfjsLib: any;

  async convertToImages(base64Pdf: string): Promise<ImagePayload[]> {
    if (!this.pdfjsLib) {
      this.pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    }

    let pdf: any = null;

    try {
      const pdfBytes = Buffer.from(base64Pdf, 'base64');
      const pdfData = new Uint8Array(pdfBytes);
      pdf = await this.pdfjsLib.getDocument({
        data: pdfData,
        useSystemFonts: true,
        disableFontFace: true,
      }).promise;
      const images: ImagePayload[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');

        await page.render({
          canvasContext: context as any,
          viewport,
          canvas: canvas as any,
        } as any).promise;

        const imageBuffer = await canvas.encode('jpeg', 85);
        const base64Image = imageBuffer.toString('base64');

        images.push({
          data: base64Image,
          media_type: 'image/jpeg',
        });

        page.cleanup();
      }

      return images;
    } catch (error) {
      throw new Error(`Failed to convert PDF: ${error.message}`);
    } finally {
      if (pdf) {
        await pdf.destroy();
      }
    }
  }
}
