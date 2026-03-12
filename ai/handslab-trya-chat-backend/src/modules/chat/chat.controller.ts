import { Body, Controller, HttpCode, Inject, Post, Get } from '@nestjs/common';
import { NewMessageDto } from './dto/new-message.dto';
import { BedrockResponse } from '@modules/awsbedrock/interfaces/bedrock-response.interface';
import { ChatService } from './chat.service';
import { UseInterceptors } from '@nestjs/common';
import { TransformInterceptor } from '@middleware/transform.interceptors';
import { MedicalImageService } from '../medical-image';

@Controller('chat')
@UseInterceptors(TransformInterceptor)
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly medicalImageService: MedicalImageService
    ) {}

    @Post()
    @HttpCode(200)
    async chat(@Body() messageDto: NewMessageDto): Promise<BedrockResponse> {
        return await this.chatService.chat(messageDto);
    }

    @Get('health')
    @HttpCode(200)
    health() {
        return { 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            service: 'nestjs-bedrock-chat' 
        };
    }

    @Get('rate-limit-status')
    @HttpCode(200)
    getRateLimitStatus() {
        const status = this.medicalImageService.getRateLimitStatus();
        return {
            ...status,
            timestamp: new Date().toISOString(),
            nextRequestAvailableAt: new Date(Date.now() + status.nextRequestAvailableIn).toISOString()
        };
    }
}
