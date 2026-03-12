import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { ApiHeader, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function ApiKeyAuth() {
  return applyDecorators(
    UseGuards(ApiKeyGuard),
    ApiHeader({
      name: 'x-api-key',
      description: 'API Key for authentication',
      required: true,
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or missing API Key',
    }),
  );
}
