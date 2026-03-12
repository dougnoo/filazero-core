export interface ImagePayload {
  data: string; // base64 encoded image
  media_type: string; // e.g., "image/jpeg", "image/png"
  original_name?: string; // original file name
}
