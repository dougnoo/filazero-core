# Medical Image Module

## Descrição

Módulo responsável pela análise de imagens médicas usando AWS Bedrock e Claude 3.5 Sonnet. Fornece funcionalidades de triagem médica preliminar com rate limiting inteligente.

## Funcionalidades

- ✅ **Análise de Triagem**: Classificação de urgência (LOW/MEDIUM/HIGH/CRITICAL)
- ✅ **Rate Limiting**: 4 requisições por minuto com fila inteligente
- ✅ **Multi-tenant**: Suporte a múltiplas operadoras
- ✅ **Validação**: Formato e tamanho de imagens
- ✅ **Fallback**: Parser robusto de respostas do Claude

## Uso

```typescript
import { MedicalImageService, ImageAnalysisResult } from '../medical-image';

// Injetar o serviço
constructor(private medicalImageService: MedicalImageService) {}

// Analisar imagem
const result: ImageAnalysisResult = await this.medicalImageService.analyzeImage(
  imageBuffer,
  'image/jpeg',
  tenantConfig
);
```

## Rate Limiting

O módulo implementa rate limiting automático:
- **Limite**: 4 requisições por minuto
- **Delay**: 15 segundos entre requisições
- **Fila**: Processamento sequencial automático
- **Monitoramento**: Endpoint `/chat/rate-limit-status`

## Estrutura

```
medical-image/
├── medical-image.module.ts     # Módulo NestJS
├── medical-image.service.ts    # Serviço principal
├── index.ts                    # Barrel exports
└── README.md                   # Esta documentação
```

## Configuração

Variáveis de ambiente necessárias:
- `AWS_REGION`: Região AWS (padrão: us-east-1)
- `AWS_PROFILE`: Perfil AWS para ambiente local
- `AWS_RUNTIME`: 'local' ou 'aws'

## Modelos Suportados

- **Primário**: `us.anthropic.claude-3-5-sonnet-20241022-v2:0`
- **Alternativas**: Claude 3.5 Sonnet v1, Nova Pro

## Disclaimer

⚠️ **IMPORTANTE**: Este módulo fornece apenas triagem preliminar. Não substitui avaliação médica profissional.