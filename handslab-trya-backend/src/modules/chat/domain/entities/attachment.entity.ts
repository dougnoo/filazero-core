import { ImagePayload } from './image-payload';

export class Attachment {
  private constructor(
    public readonly data: string,
    public readonly mediaType: string,
    public readonly originalName?: string,
  ) {}

  static create(
    data: string,
    mediaType: string,
    originalName?: string,
  ): Attachment {
    if (!data) {
      throw new Error('Attachment data is required');
    }
    if (!mediaType) {
      throw new Error('Media type is required');
    }
    return new Attachment(data, mediaType, originalName);
  }

  static fromImage(image: ImagePayload): Attachment {
    return new Attachment(image.data, image.media_type, image.original_name);
  }

  toImagePayload(): ImagePayload {
    return {
      data: this.data,
      media_type: this.mediaType,
      original_name: this.originalName,
    };
  }

  isImage(): boolean {
    return this.mediaType.startsWith('image/');
  }
}
