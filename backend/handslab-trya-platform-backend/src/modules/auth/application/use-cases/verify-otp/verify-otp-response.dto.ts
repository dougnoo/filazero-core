import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpResponseDto {
  @ApiProperty({
    description: 'Indica se o OTP é válido',
    example: true,
  })
  isValid: boolean;

  @ApiProperty({
    description: 'Mensagem de resultado',
    example: 'OTP válido',
  })
  message: string;
}
