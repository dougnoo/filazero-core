import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = this.extractApiKeyFromHeader(request);

    if (!apiKey) {
      throw new UnauthorizedException('API Key is missing');
    }

    const validApiKey = this.configService.get<string>('TRYA_PLATFORM_API_KEY');

    if (!validApiKey) {
      throw new UnauthorizedException('API Key not configured');
    }

    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }

  private extractApiKeyFromHeader(request: Request): string | undefined {
    const apiKey = request.headers['x-api-key'] as string;
    return apiKey;
  }
}
