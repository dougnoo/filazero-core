import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const NewMessageSchema = z.object({
    message: z.string().min(0, { message: 'Message should be a string' }).optional().default(''),
    model: z.enum(["amazon.titan-text-lite-v1", "anthropic.claude-3-5-haiku-20241022-v1:0","anthropic.claude-3-5-sonnet-20241022-v2:0"], { message: 'Model not found' }),
    sessionId: z.string().min(2, { message: 'Session ID should not be empty' }),
    tenantId: z.string().min(1, { message: 'Tenant ID is required' }),
    audioData: z.string().optional(), // Base64 encoded audio data
    audioMimeType: z.string().optional(), // MIME type of the audio
    imageData: z.string().optional(), // Base64 encoded image data
    imageMimeType: z.string().optional(), // MIME type of the image (image/jpeg, image/png)
    medicalConsent: z.boolean().optional().default(false), // Consent for medical image processing
    latitude: z.number().min(-90).max(90).optional(), // User's latitude for location-based services
    longitude: z.number().min(-180).max(180).optional(), // User's longitude for location-based services
}).refine(
    (data) => data.message.length > 0 || (data.audioData && data.audioData.length > 0) || (data.imageData && data.imageData.length > 0),
    {
        message: 'Either message text, audio data, or image data must be provided',
        path: ['message']
    }
).refine(
    (data) => !data.imageData || data.medicalConsent === true,
    {
        message: 'Medical consent is required when sending images',
        path: ['medicalConsent']
    }
);

export class NewMessageDto extends createZodDto(NewMessageSchema) {}