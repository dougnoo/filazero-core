# Sistema de Triagem Médica com IA

## 📋 Visão Geral

Este sistema implementa uma interface de triagem médica inteligente que se comunica com uma API de IA para realizar avaliações médicas interativas. A implementação segue as melhores práticas de desenvolvimento React/Next.js.

## 🏗️ Arquitetura

### Estrutura de Pastas

```
src/
├── app/(authenticated)/paciente/triagem/
│   ├── components/           # Componentes específicos da triagem
│   │   ├── AudioMessage.tsx
│   │   ├── AudioPreview.tsx
│   │   ├── ChatHeader.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── FileAttachment.tsx
│   │   ├── TriageResultCard.tsx
│   │   └── TriagemSidebar.tsx
│   └── page.tsx             # Página principal
├── shared/
│   ├── hooks/
│   │   └── useChat.ts       # Hook customizado para gerenciar chat
│   ├── services/
│   │   ├── audioService.ts  # Serviço de gravação de áudio
│   │   └── chatService.ts   # Serviço de integração com API
│   └── types/
│       └── chat.ts          # Tipos TypeScript
```

## 🎯 Componentes Principais

### 1. **useChat Hook**
Hook customizado que encapsula toda a lógica de estado do chat:
- Gerenciamento de mensagens
- Integração com API REST
- Gravação e envio de áudio
- Upload de arquivos
- Detecção de resultado de triagem
- Estados de loading e typing

**Uso:**
```typescript
const {
  messages,
  isTyping,
  triageResult,
  chatClosed,
  sendMessage,
  sendAudioMessage,
  // ... outros métodos
} = useChat();
```

### 2. **chatService**
Serviço que abstrai a comunicação com a API:

**Funções principais:**
- `callChatAPI(message: string)` - Envia mensagem de texto
- `callChatAPIWithAudio(blob: Blob, message: string)` - Envia áudio
- `parseTriageResult(text: string)` - Detecta conclusão da triagem
- `getOrCreateSessionId()` - Gerencia sessão do usuário

### 3. **audioService**
Serviço para gravação de áudio:
- `startAudioRecording()` - Inicia gravação
- `createAudioRecording()` - Cria objeto de áudio
- `pickAudioMimeType()` - Seleciona melhor formato de áudio

## 🔄 Fluxo de Dados

```
1. Usuário digita/fala mensagem
   ↓
2. useChat Hook captura input
   ↓
3. chatService envia para /api/chat
   ↓
4. API processa e retorna resposta
   ↓
5. parseTriageResult verifica se triagem acabou
   ↓
6. UI é atualizada com nova mensagem/resultado
```

## 🎨 Componentes de UI

### ChatMessage
Exibe mensagens de texto do bot ou usuário
```tsx
<ChatMessage
  message="Conteúdo da mensagem"
  sender="bot" | "user"
  timestamp="10:25"
/>
```

### AudioMessage
Exibe mensagens de áudio com player
```tsx
<AudioMessage
  duration="02:32"
  timestamp="10:25"
  sender="user"
/>
```

### FileAttachment
Exibe anexos de arquivo
```tsx
<FileAttachment
  fileName="documento.pdf"
  fileSize="682k • pdf"
  timestamp="10:28"
  sender="user"
/>
```

### TriageResultCard
Exibe o resultado final da triagem
```tsx
<TriageResultCard
  result={triageResult}
  onNewTriagem={() => {}}
  onConnectDoctor={() => {}}
  onDownload={() => {}}
/>
```

## 🔐 Tipos TypeScript

```typescript
interface Message {
  id: string;
  type: "text" | "audio" | "file";
  content: string;
  sender: "bot" | "user";
  timestamp: string;
  fileSize?: string;
  duration?: string;
}

interface TriageResult {
  protocolo: string;
  classificacao: "AZUL" | "VERDE" | "AMARELO" | "LARANJA" | "VERMELHO";
  prioridade?: string;
  tempo_espera_estimado?: string;
  recomendacoes?: string[];
  observacoes?: string;
  status?: string;
  timestamp?: string;
}
```

## 🚀 Boas Práticas Implementadas

### 1. **Separação de Responsabilidades**
- Lógica de negócio em hooks e services
- Componentes focados apenas em UI
- Tipos centralizados

### 2. **Reutilização de Código**
- Hook `useChat` pode ser usado em outras páginas
- Services podem ser importados em qualquer lugar
- Componentes modulares e independentes

### 3. **Type Safety**
- TypeScript em todos os arquivos
- Interfaces bem definidas
- Validação de tipos em runtime quando necessário

### 4. **Performance**
- `useCallback` para evitar re-renders desnecessários
- Cleanup de recursos (URLs de blobs, timers)
- Lazy loading de componentes quando possível

### 5. **UX**
- Indicadores de loading (typing indicator)
- Preview de áudio antes de enviar
- Confirmações visuais de ações
- Estados de erro tratados

### 6. **Acessibilidade**
- Semântica HTML correta
- Labels descritivos
- Contraste adequado de cores

## 🔧 Configuração da API

A integração espera uma API REST no endpoint `/api/chat` com o seguinte contrato:

**Request:**
```json
{
  "message": "string",
  "model": "string",
  "sessionId": "string",
  "audioData": "string (base64)", // opcional
  "audioMimeType": "string" // opcional
}
```

**Response:**
```json
{
  "answer": "string",
  // ou
  "data": {
    "answer": "string"
  }
}
```

## 📝 Detecção de Resultado

O sistema detecta automaticamente quando a triagem é concluída procurando por:

1. **JSON embutido** na resposta da IA:
```json
{
  "protocolo": "ABC123",
  "classificacao": "VERDE",
  "status": "CONCLUIDO"
}
```

2. **Padrões de texto**:
- "Triagem concluída"
- "Protocolo: ABC123"
- "Classificação: VERDE"

## 🎯 Próximos Passos

Para adicionar WebSocket (Socket.IO):

1. Criar `src/shared/services/websocketService.ts`
2. Adicionar estado no hook `useChat`
3. Implementar eventos:
   - `chat-message` - enviar mensagem
   - `chat-response` - receber resposta
   - `bot-typing` - indicador de digitação
   - `session-created` - sessão criada

## 🐛 Tratamento de Erros

- Timeout de 120 segundos para chamadas API
- Mensagens de erro amigáveis ao usuário
- Fallback para formato inesperado de resposta
- Cleanup de recursos em caso de erro

## 📚 Referências

- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material-UI Components](https://mui.com/)

