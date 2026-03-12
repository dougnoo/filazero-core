import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { AppController } from './app.controller';
import { AwsbedrockModule } from './awsbedrock/awsbedrock.module';

@Module({
  imports: [
  ConfigModule.forRoot({
    isGlobal: true,
  }), 
  ChatModule,
  AwsbedrockModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
