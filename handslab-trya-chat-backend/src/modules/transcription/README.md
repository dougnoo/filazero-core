# Transcription Module - Clean Architecture

Este módulo foi refatorado seguindo os princípios de **Clean Architecture** e **SOLID** para fornecer funcionalidades de transcrição de áudio usando AWS Transcribe.

## 📐 Arquitetura

A arquitetura segue o padrão de camadas concêntricas da Clean Architecture:

```
┌─────────────────────────────────────────────────┐
│            Interfaces Layer (API)               │
│  TranscriptionService (Facade)                  │
│  TranscriptionModule (NestJS)                   │
└────────────────┬────────────────────────────────┘
                 │ depende de ↓
┌────────────────┴────────────────────────────────┐
│         Application Layer (Use Cases)           │
│  TranscribeAudioUseCase                         │
│  StartRealtimeTranscriptionUseCase              │
└────────────────┬────────────────────────────────┘
                 │ depende de ↓
┌────────────────┴────────────────────────────────┐
│          Domain Layer (Business Logic)          │
│  Entities: AudioFile, TranscriptionResult,      │
│           TranscriptionJob, Streaming           │
│  Interfaces: IStorageClient,                    │
│             ITranscriptionClient, etc.          │
└────────────────┬────────────────────────────────┘
                 ↑ implementado por
┌────────────────┴────────────────────────────────┐
│       Infrastructure Layer (Adapters)           │
│  S3StorageAdapter                               │
│  TranscribeClientAdapter                        │
│  TranscribeStreamingAdapter                     │
│  TranscriptionParserAdapter                     │
└─────────────────────────────────────────────────┘
```

## 🎯 Princípios SOLID Aplicados

### **S** - Single Responsibility Principle
- Cada classe tem uma única responsabilidade bem definida
- `AudioFile`: Representa e valida dados de áudio
- `TranscribeAudioUseCase`: Orquestra transcrição batch
- `S3StorageAdapter`: Gerencia armazenamento S3
- `TranscriptionService`: Facade que delega para use cases

### **O** - Open/Closed Principle
- Extensível através de novos use cases sem modificar código existente
- Novos adapters podem ser adicionados sem alterar o domain
- Configurações podem ser alteradas via Dependency Injection

### **L** - Liskov Substitution Principle
- Todos os adapters podem ser substituídos por implementações alternativas
- Mock implementations podem substituir adapters em testes
- Exemplo: `S3StorageAdapter` pode ser substituído por `LocalStorageAdapter`

### **I** - Interface Segregation Principle
- Interfaces específicas para cada responsabilidade
- `IStorageClient`: apenas operações de storage
- `ITranscriptionClient`: apenas operações batch transcription
- `ITranscriptionStreamingClient`: apenas streaming

### **D** - Dependency Inversion Principle
- Use cases dependem de interfaces (abstrações), não de implementações concretas
- Adapters são injetados via tokens
- Facilita testes e substituição de implementações

## 📁 Estrutura de Diretórios

```
transcription/
├── domain/                          # Camada de domínio (pura, sem dependencies)
│   ├── entities/
│   │   ├── audio-file.entity.ts
│   │   ├── transcription-result.entity.ts
│   │   ├── transcription-job.entity.ts
│   │   └── streaming-transcription.entity.ts
│   ├── interfaces/                  # Ports (contratos)
│   │   ├── storage-client.interface.ts
│   │   ├── transcription-client.interface.ts
│   │   ├── transcription-streaming-client.interface.ts
│   │   └── transcription-parser.interface.ts
│   └── index.ts
├── application/                     # Camada de aplicação
│   └── use-cases/
│       ├── transcribe-audio.use-case.ts
│       └── start-realtime-transcription.use-case.ts
├── infrastructure/                  # Camada de infraestrutura (adapters)
│   ├── s3-storage.adapter.ts
│   ├── transcribe-client.adapter.ts
│   ├── transcribe-streaming.adapter.ts
│   └── transcription-parser.adapter.ts
├── transcription.service.ts         # Facade (orquestração)
├── transcription.module.ts          # Módulo NestJS
├── tokens.ts                        # Tokens de DI
├── index.ts                         # Public API
└── README.md                        # Este arquivo
```

## 🔄 Fluxo de Dados

### Transcrição Batch (Arquivo Completo)

```
1. Cliente chama TranscriptionService.transcribeAudio()
2. Service cria AudioFile entity (validação)
3. Service delega para TranscribeAudioUseCase
4. Use Case:
   a. Upload via IStorageClient (S3StorageAdapter)
   b. Inicia job via ITranscriptionClient (TranscribeClientAdapter)
   c. Aguarda conclusão (polling)
   d. Download resultado via IStorageClient
   e. Parse via ITranscriptionParser (TranscriptionParserAdapter)
   f. Cleanup storage
5. Retorna TranscriptionResult
```

### Transcrição Streaming (Tempo Real)

```
1. Cliente chama TranscriptionService.startRealtimeTranscription()
2. Service delega para StartRealtimeTranscriptionUseCase
3. Use Case cria StreamingTranscriptionConfig entity
4. Use Case chama ITranscriptionStreamingClient (TranscribeStreamingAdapter)
5. Adapter:
   a. Cria WritableStream para input de áudio
   b. Cria ReadableStream para output de transcrições
   c. Inicia sessão com AWS Transcribe Streaming
6. Retorna { audioStream, transcriptionStream, stop }
7. Cliente envia áudio chunks para audioStream
8. Cliente recebe eventos de transcrição de transcriptionStream
```

## 🧪 Testabilidade

A arquitetura Clean facilita testes em todos os níveis:

### Unit Tests (Domain)
```typescript
describe('AudioFile', () => {
  it('should validate MIME type', () => {
    expect(() => new AudioFile(buffer, 'invalid/type', 'session-1'))
      .toThrow('Unsupported MIME type');
  });
});
```

### Integration Tests (Use Cases)
```typescript
describe('TranscribeAudioUseCase', () => {
  let useCase: TranscribeAudioUseCase;
  let mockStorage: jest.Mocked<IStorageClient>;
  let mockClient: jest.Mocked<ITranscriptionClient>;

  beforeEach(() => {
    mockStorage = createMockStorageClient();
    mockClient = createMockTranscriptionClient();
    useCase = new TranscribeAudioUseCase(mockStorage, mockClient, ...);
  });

  it('should transcribe audio successfully', async () => {
    // Test implementation
  });
});
```

### E2E Tests (Service)
```typescript
describe('TranscriptionService', () => {
  it('should transcribe audio end-to-end', async () => {
    // Uses real AWS clients (or mocked with aws-sdk-client-mock)
  });
});
```

## 🔌 Dependency Injection

O módulo usa tokens para Dependency Injection:

```typescript
// tokens.ts
export const STORAGE_CLIENT_TOKEN = Symbol('STORAGE_CLIENT');
export const TRANSCRIPTION_CLIENT_TOKEN = Symbol('TRANSCRIPTION_CLIENT');
export const TRANSCRIPTION_STREAMING_CLIENT_TOKEN = Symbol('TRANSCRIPTION_STREAMING_CLIENT');
export const TRANSCRIPTION_PARSER_TOKEN = Symbol('TRANSCRIPTION_PARSER');

// transcription.module.ts
providers: [
  {
    provide: STORAGE_CLIENT_TOKEN,
    useClass: S3StorageAdapter, // Pode ser substituído por MockStorageAdapter em testes
  },
  // ...
]
```

## 🔀 Backward Compatibility

O `TranscriptionService` mantém compatibilidade com código legado:

```typescript
// Interface legada exportada
export interface TranscriptionResult {
  text: string;
  confidence: number;
  segments?: Array<{...}>;
}

// Internamente, usa entities do domain
const audioFile = new AudioFile(buffer, mimeType, sessionId);
const domainResult = await this.transcribeAudioUseCase.execute(audioFile);

// Mapeia de volta para interface legada
return {
  text: domainResult.text,
  confidence: domainResult.confidence,
  // ...
};
```

## 🚀 Como Usar

### Transcrição Batch

```typescript
import { TranscriptionService } from '@modules/transcription';

constructor(private transcriptionService: TranscriptionService) {}

async transcribeAudioFile(audioBuffer: Buffer, mimeType: string) {
  const result = await this.transcriptionService.transcribeAudio(
    audioBuffer,
    mimeType,
    'session-123'
  );
  console.log(`Transcribed: ${result.text}`);
  console.log(`Confidence: ${result.confidence}`);
}
```

### Transcrição Streaming

```typescript
const { audioStream, transcriptionStream, stop } = 
  await this.transcriptionService.startRealtimeTranscription('session-123', {
    sampleRate: 16000,
    mediaEncoding: 'pcm',
    languageCode: 'pt-BR',
  });

// Enviar áudio
const writer = audioStream.getWriter();
await writer.write(audioChunk); // Uint8Array

// Receber transcrições
const reader = transcriptionStream.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  if (value.type === 'final') {
    console.log(`Final transcript: ${value.text}`);
  }
}

// Parar streaming
stop();
```

## ⚙️ Configuração

Variáveis de ambiente:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_RUNTIME=aws  # or 'local' for local AWS profile
AWS_PROFILE=default  # Only for local runtime

# Transcribe Configuration
TRANSCRIBE_BUCKET_NAME=bedrock-chat-transcribe
TRANSCRIBE_TIMEOUT_MS=30000
TRANSCRIBE_ENABLE_SPEAKER_LABELS=false
TRANSCRIBE_MAX_SPEAKER_LABELS=2
TRANSCRIBE_MAX_ALTERNATIVES=2
```

## 📚 Referências

- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)

## 🔄 Migração do Código Legado

Se você está migrando de código que usa `TranscriptionService` diretamente:

### Antes (Legado)
```typescript
// Service tinha toda a lógica misturada
class TranscriptionService {
  async transcribeAudio(...) {
    // Upload S3
    // Iniciar job
    // Aguardar
    // Parse resultado
    // Cleanup
  }
}
```

### Depois (Clean Architecture)
```typescript
// Service é apenas facade
class TranscriptionService {
  async transcribeAudio(...) {
    const audioFile = new AudioFile(...);
    return await this.transcribeAudioUseCase.execute(audioFile);
  }
}

// Lógica em use case testável
class TranscribeAudioUseCase {
  async execute(audioFile: AudioFile) {
    // Mesma lógica, mas com dependências injetadas
    await this.storageClient.upload(...);
    await this.transcriptionClient.startJob(...);
    // ...
  }
}
```

✅ **Nenhuma mudança necessária no código que chama `TranscriptionService`!**
