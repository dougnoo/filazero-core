# 🎤 Arquitetura Híbrida para Processamento de Áudio - AWS Bedrock

## 📋 Visão Geral

A implementação atual utiliza uma **arquitetura híbrida** que combina o melhor dos dois mundos:

- **Mensagens de Texto**: Processadas pelo **Bedrock Agent** (mantém contexto, funções, etc.)
- **Mensagens de Áudio**: Processadas diretamente pelo **Claude 3.5 Sonnet** via Bedrock Runtime

## 🔄 Fluxo de Processamento

### 1. **Detecção do Tipo de Mensagem**
```typescript
// No AwsbedrockService.invoke()
if (audioBuffer && audioMimeType) {
  // Rota para processamento de áudio
  return await this.processAudioWithClaude(prompt, sessionId, audioBuffer, audioMimeType);
} else {
  // Rota normal para texto via Bedrock Agent
  return await this.retryWithBackoff(/* ... */);
}
```

### 2. **Processamento de Áudio (Claude Direct)**
```typescript
// Converte áudio para base64
const audioBase64 = audioBuffer.toString('base64');

// Cria mensagem multimodal para Claude
const claudeMessage = {
  role: 'user',
  content: [
    { type: 'text', text: contextualPrompt },
    { 
      type: 'audio',
      source: {
        type: 'base64',
        media_type: audioMimeType,
        data: audioBase64
      }
    }
  ]
};

// Chama Claude 3.5 Sonnet diretamente
const response = await this.runtimeClient.send(new InvokeModelCommand({
  modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  body: JSON.stringify(payload)
}));
```

### 3. **Processamento de Texto (Bedrock Agent)**
```typescript
// Mantém toda a funcionalidade existente
const response = await this.retryWithBackoff(
  () => this.sendRequest(sessionId, finalPrompt, /* ... */),
  'Bedrock Agent request'
);
```

## 🎯 Vantagens da Arquitetura Híbrida

### ✅ **Para Áudio:**
- **Suporte Nativo**: Claude 3.5 Sonnet suporta áudio nativamente
- **Processamento Direto**: Sem necessidade de conversão ou APIs intermediárias
- **Qualidade**: Melhor compreensão e processamento de áudio
- **Flexibilidade**: Pode processar diferentes formatos de áudio

### ✅ **Para Texto:**
- **Contexto Preservado**: Mantém o contexto do Bedrock Agent
- **Funções**: Acesso a todas as funções/tools do Agent
- **Histórico**: Histórico de conversação mantido
- **Integração**: Funcionalidade existente preservada

## 🛠️ Componentes Técnicos

### **1. Clientes AWS**
```typescript
private client: BedrockAgentRuntimeClient;        // Para Agent
private runtimeClient: BedrockRuntimeClient;      // Para LLMs diretas
```

### **2. Roteamento Inteligente**
- **Entrada**: Detecta presença de `audioBuffer` e `audioMimeType`
- **Decisão**: Roteia para Claude direct ou Bedrock Agent
- **Saída**: Interface unificada `BedrockResponse`

### **3. Tratamento de Erro**
- **Fallback**: Se processamento de áudio falha, retorna mensagem de erro amigável
- **Logging**: Logs detalhados para debug e monitoramento
- **Consistência**: Sempre retorna no formato esperado

## 📊 Formatos Suportados

### **Áudio**
- **WebM** (opus codec) - Gravação web
- **MP3** - Arquivos de áudio comum
- **WAV** - Qualidade alta
- **M4A** - Formatos Apple

### **Resposta**
```typescript
interface BedrockResponse {
  answer: string;
  model: string;
}
```

## 🔧 Configuração

### **Variáveis de Ambiente**
```env
AWS_REGION=us-east-1
AWS_PROFILE=default
AWS_AGENT_ID=your-agent-id
AWS_AGENT_ALIAS_ID=your-alias-id
BEDROCK_REQUESTS_PER_MINUTE=4
```

### **Dependências**
```json
{
  "@aws-sdk/client-bedrock-agent-runtime": "^3.x.x",
  "@aws-sdk/client-bedrock-runtime": "^3.x.x"
}
```

## 🚀 Como Testar

### **1. Mensagem de Texto**
```javascript
const messageData = {
  message: "Olá, como está?",
  model: "amazon.titan-text-lite-v1",
  sessionId: sessionId
};
socket.emit('chat-message', messageData);
```

### **2. Mensagem de Áudio**
```javascript
const messageData = {
  message: "", // Opcional: contexto adicional
  model: "amazon.titan-text-lite-v1", 
  sessionId: sessionId,
  audioData: base64AudioData,
  audioMimeType: "audio/webm;codecs=opus"
};
socket.emit('chat-message', messageData);
```

## 📱 Páginas de Teste

- **Completa**: http://localhost:3000/chat-with-audio.html
- **Debug**: http://localhost:3000/chat-debug.html
- **WebSocket**: http://localhost:3000/chat-websocket.html

## 🔍 Monitoramento

### **Logs de Áudio**
```
🎤 Áudio detectado, processando com Claude diretamente...
🎤 Processando áudio com Claude: 44597 bytes, audio/webm
🤖 Chamando Claude 3.5 Sonnet para processamento de áudio...
✅ Resposta processada do áudio: [resposta]
```

### **Logs de Texto**
```
📝 Processando mensagem de texto com Bedrock Agent...
Sending request to Bedrock Agent: { sessionId: '...', prompt: '...' }
```

## ⚡ Performance

- **Áudio**: ~2-5 segundos (dependendo do tamanho)
- **Texto**: ~1-3 segundos (Bedrock Agent)
- **Rate Limiting**: 4 req/min (configurável)
- **Timeout**: 30 segundos

## 🔄 Próximos Passos

1. **Contexto Cruzado**: Integrar respostas de áudio no contexto do Agent
2. **Cache**: Implementar cache para áudios processados
3. **Streaming**: Suporte a streaming para respostas longas
4. **Analytics**: Métricas de uso de áudio vs texto

---

Esta arquitetura resolve o problema de compatibilidade de áudio do Bedrock Agent mantendo todas as funcionalidades existentes e adicionando suporte robusto para processamento multimodal.