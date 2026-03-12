# Transcrição de Áudio com Amazon Transcribe

## Visão Geral

O sistema de triagem médica agora suporta mensagens de áudio que são automaticamente transcritas para texto usando o **Amazon Transcribe**. Isso permite que pacientes enviem mensagens de voz ao invés de digitar.

## Arquitetura

```
Cliente → Lambda Handler → Transcription Service → Amazon Transcribe
                                 ↓
                            Upload para S3
                                 ↓
                          Job de Transcrição
                                 ↓
                         Texto Transcrito → Workflow
```

## Funcionalidades

### 1. Transcrição Automática
- Suporta múltiplos formatos de áudio: MP3, WAV, OGG, FLAC, etc.
- Áudio enviado em base64 ou via URL S3
- Idioma padrão: Português Brasileiro (`pt-BR`)

### 2. Gerenciamento de Bucket S3
- Criação automática de bucket se não existir
- Lifecycle policy: arquivos deletados após 1 dia
- Cleanup automático de jobs de transcrição

### 3. Tratamento de Erros
- Timeout configurável (padrão: 60 segundos)
- Logs detalhados em cada etapa
- Fallback em caso de falha

## Como Usar

### Payload com Áudio (base64)

```json
{
  "session_id": "session-123",
  "user_id": "user-456",
  "audio": "BASE64_ENCODED_AUDIO_DATA",
  "audio_format": "mp3"
}
```

### Payload com URL S3

```json
{
  "session_id": "session-123",
  "user_id": "user-456",
  "audio": "s3://my-bucket/audio/file.mp3",
  "audio_format": "mp3"
}
```

### Payload com Mensagem de Texto (modo original)

```json
{
  "session_id": "session-123",
  "user_id": "user-456",
  "message": "Estou com dor de cabeça"
}
```

## Formatos de Áudio Suportados

| Formato | Extensão | Compatível |
|---------|----------|------------|
| MP3 | `.mp3` | ✅ |
| WAV | `.wav` | ✅ |
| OGG | `.ogg` | ✅ |
| FLAC | `.flac` | ✅ |
| MP4 | `.mp4` | ✅ |
| WebM | `.webm` | ✅ |

## Configuração

### Variáveis de Ambiente

```bash
# Bucket S3 para armazenamento temporário de áudios (opcional)
TRANSCRIPTION_S3_BUCKET=my-transcription-bucket

# Região AWS (padrão: us-east-1)
AWS_REGION=us-east-1
```

Se `TRANSCRIPTION_S3_BUCKET` não for definido, um bucket será criado automaticamente com nome aleatório.

### Permissões IAM Necessárias

A função Lambda precisa das seguintes permissões:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "transcribe:StartTranscriptionJob",
        "transcribe:GetTranscriptionJob",
        "transcribe:DeleteTranscriptionJob"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutBucketLifecycleConfiguration"
      ],
      "Resource": [
        "arn:aws:s3:::medical-triage-audio-*",
        "arn:aws:s3:::medical-triage-audio-*/*"
      ]
    }
  ]
}
```

## Exemplo de Uso - Frontend

### JavaScript/React

```javascript
// Capturar áudio do microfone
async function recordAudio() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  const audioChunks = [];

  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
    const audioBase64 = await blobToBase64(audioBlob);
    
    // Enviar para a Lambda
    await fetch('https://your-api.execute-api.us-east-1.amazonaws.com/prod/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: 'session-123',
        user_id: 'user-456',
        audio: audioBase64,
        audio_format: 'mp3'
      })
    });
  };

  mediaRecorder.start();
  setTimeout(() => mediaRecorder.stop(), 5000); // Grava por 5 segundos
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

### Python

```python
import base64
import requests

# Ler arquivo de áudio
with open('audio.mp3', 'rb') as f:
    audio_bytes = f.read()
    audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')

# Enviar para a Lambda
response = requests.post(
    'https://your-api.execute-api.us-east-1.amazonaws.com/prod/chat',
    json={
        'session_id': 'session-123',
        'user_id': 'user-456',
        'audio': audio_base64,
        'audio_format': 'mp3'
    }
)

print(response.json())
```

## Teste Local

```python
import base64
from src.services.transcription import transcribe_audio_message

# Carregar áudio de teste
with open('test_audio.mp3', 'rb') as f:
    audio_base64 = base64.b64encode(f.read()).decode('utf-8')

# Transcrever
text = transcribe_audio_message(audio_base64, audio_format='mp3')
print(f"Texto transcrito: {text}")
```

## Limitações

1. **Tamanho do áudio**: Amazon Transcribe tem limite de 2 GB por arquivo
2. **Duração**: Recomendado até 4 horas de áudio
3. **Tempo de processamento**: Geralmente ~30% da duração do áudio (ex: 1 minuto de áudio = ~18 segundos de processamento)
4. **Custo**: $0.024 por minuto de áudio transcrito (verificar preços atuais da AWS)

## Logs e Monitoramento

O serviço produz logs detalhados em cada etapa:

```
🎙️ Áudio recebido (formato: mp3), iniciando transcrição...
⬆️ Fazendo upload de áudio para S3: audio/abc123.mp3
✅ Upload concluído: s3://bucket/audio/abc123.mp3
🎙️ Iniciando transcrição: job=transcription-xyz789, uri=s3://...
✅ Transcrição concluída: 'Estou com dor de cabeça há dois dias...'
```

## Troubleshooting

### Erro: "Bucket does not exist"
- Verifique permissões IAM para S3
- Defina `TRANSCRIPTION_S3_BUCKET` manualmente

### Erro: "Transcription timeout"
- Aumente o timeout (padrão: 60s)
- Verifique se o áudio está corrompido

### Erro: "Invalid audio format"
- Confirme que o formato está correto
- Teste com formatos suportados (MP3, WAV)

## Próximas Melhorias

- [ ] Suporte para múltiplos idiomas
- [ ] Identificação automática de idioma
- [ ] Detecção de múltiplos falantes
- [ ] Streaming de áudio em tempo real
- [ ] Cache de transcrições
