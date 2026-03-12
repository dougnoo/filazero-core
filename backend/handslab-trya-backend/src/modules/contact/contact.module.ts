import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContactController } from './presentation/controllers/contact.controller';
import { SendContactMessageUseCase } from './application/use-cases/send-contact-message.use-case';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [ContactController],
  providers: [SendContactMessageUseCase],
})
export class ContactModule {}
