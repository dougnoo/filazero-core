import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './modules/auth/presentation/decorators/public.decorator';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Hello World',
    description: 'Retorna mensagem de boas-vindas',
  })
  @ApiResponse({ status: 200, description: 'Mensagem de boas-vindas' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Verifica o status e saúde da aplicação',
  })
  @ApiResponse({
    status: 200,
    description: 'API funcionando normalmente',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        service: 'trya-backend',
        version: '1.0.0',
      },
    },
  })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'trya-backend',
      version: '1.0.0',
    };
  }
}
