# Implementação da Transcrição em Tempo Real

## Visão Geral

O método `startRealtimeTranscription` foi implementado usando **Amazon Transcribe Streaming**, que permite transcrição de áudio em tempo real com resultados parciais e finais.

## Características da Implementação

### 🎯 **Funcionalidades Principais**

1. **Streaming Bidirecionall**: 
   - Stream de entrada para chunks de áudio
   - Stream de saída para eventos de transcrição

2. **Resultados em Tempo Real**:
   - Transcrições parciais (enquanto você fala)
   - Transcrições finais (quando você para de falar)
   - Controle de confiança e estabilidade

3. **Configurações Personalizáveis**:
   - Taxa de amostragem (sample rate)
   - Codificação de mídia (PCM, OPUS, etc.)
   - Idioma (português brasileiro por padrão)
   - Estabilização de resultados parciais

### 🔧 **Configurações Disponíveis**

```typescript
interface StreamingTranscriptionOptions {
  sampleRate?: number;                    // Default: 16000 Hz
  mediaEncoding?: MediaEncoding;          // Default: PCM
  languageCode?: StreamingLanguageCode;   // Default: PT_BR
  enablePartialResultsStabilization?: boolean; // Default: true
  partialResultsStability?: 'high' | 'medium' | 'low'; // Default: 'medium'
}
```

### 🎤 **Como Usar**

#### **1. Uso Básico**

```typescript
const { audioStream, transcriptionStream, stop } = await transcriptionService
  .startRealtimeTranscription('session-123');

// Processar transcrições
const reader = transcriptionStream.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  if (value.type === 'final') {
    console.log(`Texto final: ${value.text}`);
    // Enviar para o chatbot
  }
}

// Enviar áudio
const writer = audioStream.getWriter();
await writer.write(audioChunk); // Uint8Array do microfone
```

#### **2. Uso Avançado com Configurações**

```typescript
const options: StreamingTranscriptionOptions = {
  sampleRate: 44100,
  mediaEncoding: MediaEncoding.PCM,
  languageCode: LanguageCode.PT_BR,
  enablePartialResultsStabilization: true,
  partialResultsStability: 'high'
};

const transcription = await transcriptionService
  .startRealtimeTranscription('session-123', options);
```

## 📡 **Tipos de Eventos**

### **StreamingTranscriptionEvent**

```typescript
interface StreamingTranscriptionEvent {
  type: 'partial' | 'final' | 'error' | 'complete';
  text?: string;           // Texto transcrito
  confidence?: number;     // Confiança (0-1)
  isPartial?: boolean;     // Se é resultado parcial
  error?: string;          // Mensagem de erro
}
```

### **Exemplos de Eventos**

```typescript
// Resultado parcial (enquanto falando)
{
  type: 'partial',
  text: 'Olá, como você est',
  confidence: 0.85,
  isPartial: true
}

// Resultado final (parou de falar)
{
  type: 'final',
  text: 'Olá, como você está hoje?',
  confidence: 0.92,
  isPartial: false
}

// Erro
{
  type: 'error',
  error: 'Limite de requisições excedido'
}

// Fim do stream
{
  type: 'complete'
}
```

## 🔗 **Integração com WebSocket**

### **No Cliente (JavaScript)**

```javascript
// Conectar ao WebSocket
const socket = io();

// Iniciar gravação de áudio
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const mediaRecorder = new MediaRecorder(stream);
    
    // Quando dados estão disponíveis
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        // Converter para ArrayBuffer e enviar
        event.data.arrayBuffer().then(buffer => {
          socket.emit('audio-chunk', buffer);
        });
      }
    };
    
    // Iniciar gravação com chunks pequenos para tempo real
    mediaRecorder.start(100); // 100ms chunks
  });

// Receber transcrições
socket.on('transcription-event', (data) => {
  if (data.type === 'partial') {
    updatePartialTranscription(data.text);
  } else if (data.type === 'final') {
    processFinalTranscription(data.text);
  }
});
```

### **No Servidor (NestJS)**

```typescript
@WebSocketGateway()
export class TranscriptionGateway {
  constructor(private transcriptionService: TranscriptionService) {}

  @SubscribeMessage('start-transcription')
  async handleStartTranscription(@ConnectedSocket() client: Socket) {
    const sessionId = client.id;
    
    const { audioStream, transcriptionStream, stop } = 
      await this.transcriptionService.startRealtimeTranscription(sessionId);
    
    // Processar eventos e enviar para cliente
    const reader = transcriptionStream.getReader();
    this.processAndEmitEvents(reader, client);
    
    // Armazenar referência para cleanup
    client.data.transcriptionStop = stop;
  }

  @SubscribeMessage('audio-chunk')
  async handleAudioChunk(
    @ConnectedSocket() client: Socket,
    @MessageBody() audioData: ArrayBuffer
  ) {
    // Enviar para stream de áudio
    // (implementação detalhada no exemplo)
  }
}
```

## 🚀 **Vantagens da Implementação**

### **1. Performance**
- ✅ Latência baixa (resultados em ~100-500ms)
- ✅ Streaming contínuo sem acúmulo de buffer
- ✅ Processamento paralelo de áudio e texto

### **2. Flexibilidade**
- ✅ Configurações personalizáveis por sessão
- ✅ Suporte a diferentes formatos de áudio
- ✅ Controle fino de qualidade vs. velocidade

### **3. Robustez**
- ✅ Tratamento de erros abrangente
- ✅ Cleanup automático de recursos
- ✅ Reconexão e recuperação de falhas

### **4. Integração**
- ✅ Compatible com WebSockets
- ✅ Funciona com MediaRecorder API
- ✅ Fácil integração com chatbots existentes

## 📊 **Custos e Limites**

### **Amazon Transcribe Streaming**
- **Custo**: ~$0.024 por minuto de áudio
- **Limite**: 5 streams simultâneos por conta (padrão)
- **Latência**: 100-500ms para resultados parciais
- **Qualidade**: Muito alta para português brasileiro

### **Otimizações de Custo**
1. **Detecção de Silêncio**: Pausar streaming durante silêncio
2. **Configuração de Estabilidade**: Usar 'low' para menos processamento
3. **Timeout Inteligente**: Parar automaticamente streams inativos

## 🔧 **Configuração Necessária**

### **1. Instalar Dependência**
```bash
npm install @aws-sdk/client-transcribe-streaming
```

### **2. Configurar Permissões IAM**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "transcribe:StartStreamTranscription"
      ],
      "Resource": "*"
    }
  ]
}
```

### **3. Variáveis de Ambiente**
```env
AWS_REGION=us-east-1
AWS_PROFILE=default
# Não são necessárias configurações extras para streaming
```

## 🎯 **Casos de Uso Ideais**

1. **Chat por Voz em Tempo Real**
   - Conversação fluida com chatbot
   - Feedback visual durante a fala

2. **Transcrição de Reuniões**
   - Atas automáticas
   - Identificação de falantes

3. **Assistentes Virtuais**
   - Comandos por voz
   - Respostas imediatas

4. **Aplicações de Acessibilidade**
   - Legendas ao vivo
   - Assistência para deficientes auditivos

## ⚠️ **Considerações Importantes**

### **1. Qualidade do Áudio**
- Microfone de boa qualidade recomendado
- Ambiente com pouco ruído
- Taxa de amostragem mínima de 16kHz

### **2. Conectividade**
- Conexão estável necessária
- Bandwidth: ~64kbps para áudio PCM 16kHz
- Latência de rede < 100ms recomendada

### **3. Gerenciamento de Recursos**
- Sempre chamar `stop()` para limpar recursos
- Monitorar streams ativos
- Implementar timeouts apropriados

Esta implementação fornece uma base sólida para transcrição de áudio em tempo real, com foco em performance, qualidade e facilidade de uso! 🎉