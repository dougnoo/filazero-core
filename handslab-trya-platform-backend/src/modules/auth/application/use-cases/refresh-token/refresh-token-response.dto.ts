import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'Novo token de acesso JWT',
    example: 'eyJraWQiOiJxVGhMOEU4...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Novo refresh token',
    example:
      'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Tempo de expiração do token em segundos',
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Tipo do token',
    example: 'Bearer',
  })
  tokenType: string;

  constructor(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    tokenType: string = 'Bearer',
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresIn = expiresIn;
    this.tokenType = tokenType;
  }
}
