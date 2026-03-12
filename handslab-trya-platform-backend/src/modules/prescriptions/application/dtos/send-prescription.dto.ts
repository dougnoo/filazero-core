import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';

export enum SendVia {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
}

export class SendPrescriptionDto {
  @IsArray()
  @IsEnum(SendVia, { each: true })
  sendVia: SendVia[];

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
