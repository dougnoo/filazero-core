import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MissingTermAcceptanceDto } from '../../../../terms/application/use-cases/check-term-acceptance/missing-term-acceptance.dto';

/**
 * DTO para termos pendentes retornados no login
 */
export class MissingTermDto {
  @ApiProperty({ example: 'term-version-uuid-1234' })
  id: string;

  @ApiProperty({
    example: 'TERMS_OF_USE',
    enum: ['TERMS_OF_USE', 'PRIVACY_POLICY'],
  })
  type: string;

  @ApiProperty({ example: '1' })
  version: string;

  @ApiProperty({
    description: 'URL do documento (vinda do banco de dados)',
    example: 'https://cdn.example.com/terms/latest.pdf',
  })
  s3Url: string;
}

export class SignInResponseDto {
  @ApiPropertyOptional({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiPropertyOptional({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken?: string;

  @ApiPropertyOptional({ example: 3600 })
  expiresIn: number;

  @ApiPropertyOptional({
    description:
      'Termos pendentes de aceite. Se não vazio, o front deve redirecionar para tela de aceite.',
    type: [MissingTermDto],
    example: [
      {
        id: 'term-uuid',
        type: 'TERMS_OF_USE',
        version: '1',
        s3Url: 'https://...',
      },
    ],
  })
  missingTerms?: MissingTermAcceptanceDto[];

  // Campos para challenge NEW_PASSWORD_REQUIRED
  @ApiPropertyOptional({ example: 'NEW_PASSWORD_REQUIRED' })
  challengeName?: string;

  @ApiPropertyOptional()
  session?: string;
}
