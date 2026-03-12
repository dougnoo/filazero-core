# Invocação da Lambda via NestJS

## Visão Geral

A Lambda `triagem-saude-agente` pode ser invocada diretamente do seu backend NestJS usando o AWS SDK v3. Não há mais API Gateway ou WebSocket - você tem controle total da autenticação e comunicação no seu backend.

## Vantagens

✅ **Sem timeout de 29s** - Lambda pode executar até 120 segundos  
✅ **Controle total de autenticação** - Use seus middlewares Passport/Guard  
✅ **Sem custos de API Gateway** - Apenas custos da Lambda e DynamoDB  
✅ **Sessões persistentes** - DynamoDB mantém histórico com TTL de 7 dias (LGPD)  
✅ **Streaming opcional** - Pode implementar SSE ou WebSocket no NestJS

## Setup no NestJS

### 1. Instalar dependências

```bash
npm install @aws-sdk/client-lambda
```

### 2. Criar módulo de configuração AWS

```typescript
// src/config/aws.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => ({
  region: process.env.AWS_REGION || 'us-east-1',
  lambdaFunctionName: process.env.TRIAGEM_LAMBDA_FUNCTION || 'triagem-saude-agente-dev',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
}));
```

### 3. Criar serviço de invocação Lambda

```typescript
// src/triagem/triagem-lambda.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

export interface TriagemRequest {
  message: string;
  session_id: string;
  user_id?: string; // Opcional: ID do usuário para persistência
}

export interface TriagemResponse {
  message: string;
  session_id: string;
  patient_data: {
    symptoms?: string[];
    intensity?: string;
    duration?: string;
  };
  medical_summary?: {
    conversation_summary: string;
    main_symptoms: string[];
    chief_complaint: string;
    suggested_exams: string[];
  };
  is_complete: boolean;
}

@Injectable()
export class TriagemLambdaService {
  private readonly logger = new Logger(TriagemLambdaService.name);
  private lambdaClient: LambdaClient;
  private functionName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('aws.region');
    this.functionName = this.configService.get<string>('aws.lambdaFunctionName');
    
    this.lambdaClient = new LambdaClient({
      region,
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId'),
        secretAccessKey: this.configService.get<string>('aws.secretAccessKey'),
      },
    });
  }

  async invokeTriagem(request: TriagemRequest): Promise<TriagemResponse> {
    this.logger.log(`Invoking Lambda for session ${request.session_id}`);
    
    try {
      const command = new InvokeCommand({
        FunctionName: this.functionName,
        InvocationType: 'RequestResponse', // Síncrono
        Payload: JSON.stringify(request),
      });

      const response = await this.lambdaClient.send(command);
      
      if (response.FunctionError) {
        this.logger.error(`Lambda error: ${response.FunctionError}`);
        throw new Error(`Lambda execution failed: ${response.FunctionError}`);
      }

      const payload = JSON.parse(new TextDecoder().decode(response.Payload));
      
      // Se a Lambda retornou formato API Gateway (statusCode + body)
      if (payload.statusCode) {
        const body = JSON.parse(payload.body);
        return body;
      }
      
      // Invocação direta - payload já é o resultado
      return payload;
      
    } catch (error) {
      this.logger.error(`Failed to invoke Lambda: ${error.message}`);
      throw error;
    }
  }

  async invokeTriage Async(request: TriagemRequest): Promise<string> {
    this.logger.log(`Invoking Lambda ASYNC for session ${request.session_id}`);
    
    try {
      const command = new InvokeCommand({
        FunctionName: this.functionName,
        InvocationType: 'Event', // Assíncrono
        Payload: JSON.stringify(request),
      });

      await this.lambdaClient.send(command);
      return 'Processing started';
      
    } catch (error) {
      this.logger.error(`Failed to invoke Lambda async: ${error.message}`);
      throw error;
    }
  }
}
```

### 4. Criar controller REST

```typescript
// src/triagem/triagem.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TriagemLambdaService } from './triagem-lambda.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Seu guard de autenticação
import { v4 as uuidv4 } from 'uuid';

class SendMessageDto {
  message: string;
  session_id?: string;
}

@Controller('triagem')
@UseGuards(JwtAuthGuard) // Protege com autenticação JWT
export class TriagemController {
  constructor(private triagemService: TriagemLambdaService) {}

  @Post('message')
  async sendMessage(@Body() dto: SendMessageDto, @Req() req) {
    const userId = req.user.id; // ID do usuário autenticado
    
    // Gera session_id único por usuário se não fornecido
    const sessionId = dto.session_id || `${userId}-${uuidv4()}`;
    
    const response = await this.triagemService.invokeTriagem({
      message: dto.message,
      session_id: sessionId,
    });

    return response;
  }
}
```

### 5. Criar módulo

```typescript
// src/triagem/triagem.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TriagemController } from './triagem.controller';
import { TriagemLambdaService } from './triagem-lambda.service';
import awsConfig from '../config/aws.config';

@Module({
  imports: [ConfigModule.forFeature(awsConfig)],
  controllers: [TriagemController],
  providers: [TriagemLambdaService],
  exports: [TriagemLambdaService],
})
export class TriagemModule {}
```

### 6. Configurar variáveis de ambiente

```env
# .env
AWS_REGION=us-east-1
TRIAGEM_LAMBDA_FUNCTION=triagem-saude-agente-dev
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

## Implementação com SSE (Server-Sent Events)

Se você quer streaming em tempo real:

```typescript
// src/triagem/triagem.controller.ts
import { Sse, MessageEvent } from '@nestjs/common';
import { Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Sse('stream')
async streamTriagem(@Body() dto: SendMessageDto): Observable<MessageEvent> {
  // Invoke Lambda async
  const sessionId = dto.session_id || uuidv4();
  await this.triagemService.invokeTriagemAsync({
    message: dto.message,
    session_id: sessionId,
  });

  // Poll DynamoDB ou use DynamoDB Streams para status updates
  return interval(1000).pipe(
    map(() => ({
      data: { sessionId, status: 'processing' },
    })),
  );
}
```

## Deploy da Lambda

```bash
sam build
sam deploy --config-env dev
```

Outputs importantes:
- `TriagemSaudeFunctionName`: Nome da função (ex: `triagem-saude-agente-dev`)
- `TriagemSaudeFunctionArn`: ARN completo
- `SessionsTableName`: Tabela DynamoDB com sessões

## Permissões IAM

O usuário/role IAM do NestJS precisa ter permissão para invocar a Lambda:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": "arn:aws:lambda:us-east-1:416684166863:function:triagem-saude-agente-*"
    }
  ]
}
```

## Teste local (sem NestJS)

Você pode testar a invocação com AWS CLI:

```bash
aws lambda invoke \
  --function-name triagem-saude-agente-dev \
  --payload '{"message":"estou com dor de cabeça","session_id":"test-123"}' \
  --profile AWSPowerUserAccess-416684166863 \
  response.json

cat response.json
```

## Monitoramento

- **CloudWatch Logs**: Logs da Lambda em `/aws/lambda/triagem-saude-agente-dev`
- **CloudWatch Metrics**: Duração, invocações, erros
- **X-Ray**: Adicione tracing para visualizar latência end-to-end
- **DynamoDB**: Monitore leituras/escritas na tabela `triagem-sessions-dev`

## Custos estimados

- Lambda: $0.20 por 1M invocações + $0.0000166667/GB-segundo
  - Exemplo: 10k invocações/mês, 512MB, 10s cada = ~$0.84/mês
- DynamoDB: PAY_PER_REQUEST
  - Read: $0.25 por 1M requests
  - Write: $1.25 por 1M requests
  - Exemplo: 10k sessões/mês = ~$0.03/mês
- **Total estimado**: < $1/mês para 10k conversas

## Próximos passos

1. ✅ Deploy da Lambda simplificada (sem API Gateway)
2. ✅ Integrar no seu NestJS
3. Adicionar rate limiting por usuário
4. Implementar webhook para notificações assíncronas
5. Adicionar DynamoDB Streams para processar finalizações
