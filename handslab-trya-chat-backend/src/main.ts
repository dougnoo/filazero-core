import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ZodValidationPipe());
  
  // Servir arquivos estáticos (para o exemplo HTML)
  app.useStaticAssets(join(__dirname, '..', 'public'));

  console.log('🚀 Servidor iniciado em http://localhost:3000');
  console.log('📱 Chat WebSocket disponível em http://localhost:3000/chat-websocket.html');
  console.log('🎤 Chat com Áudio disponível em http://localhost:3000/chat-with-audio.html');
  console.log('🔧 Chat Debug disponível em http://localhost:3000/chat-debug.html');  
  console.log('⚙️  Setup Transcribe em http://localhost:3000/setup-transcribe.html');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
