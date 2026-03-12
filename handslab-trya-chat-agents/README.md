# Agente de Triagem de Saúde

Sistema de triagem de saúde baseado em agentes usando LangChain e LangGraph, deployado como Lambda na AWS.

Utiliza **Claude 3.5 Sonnet** via AWS Bedrock para processamento de linguagem natural.

## Arquitetura

O sistema utiliza uma arquitetura multi-agente:

- **Supervisor**: Coordena o atendimento e redireciona para o agente apropriado
- **Agente de Onboarding**: Coleta condições crônicas, medicamentos e alergias
- **Agente de Levantamento de Dados**: Coleta sintomas e informações do paciente
- **Agente de Análise de Imagens**: Analisa fotos de lesões, exames e documentos médicos usando Claude Vision
- **Serviço de Transcrição**: Converte mensagens de áudio em texto usando Amazon Transcribe

Todos os agentes utilizam **AWS Bedrock** com Claude 3.5 Sonnet

### 🔌 Storage Plugável (NOVO)

Sistema modular de armazenamento de sessões com múltiplos backends:

- **MemoryStorage**: Desenvolvimento local (sem persistência)
- **RedisStorage**: Cache rápido com TTL (ElastiCache/Valkey)
- **DynamoDBStorage**: Persistência durável
- **HybridStorage** ⭐: Cache (Redis) + Persistência (DynamoDB) - **RECOMENDADO**

```bash
# Escolha o backend via variável de ambiente
STORAGE_BACKEND=hybrid  # memory | redis | dynamodb | hybrid
```

📖 [Documentação completa](docs/STORAGE_ARCHITECTURE.md)

### Funcionalidades

✅ **Onboarding automático** - coleta condições crônicas, medicamentos e alergias  
✅ Triagem médica conversacional via texto  
✅ **Análise de imagens médicas com IA** (fotos, exames, documentos)  
✅ **Armazenamento automático de imagens no S3** (7 dias TTL)  
✅ **Storage plugável** - troca entre Memory/Redis/DynamoDB/Hybrid  
✅ Transcrição automática de mensagens de áudio  
✅ Gerenciamento de sessões com histórico  
✅ Coleta estruturada de sintomas  
✅ Resumo médico automatizado com análises de imagens  
✅ Conformidade com LGPD

## Estrutura do Projeto

```
langchain-aws/
├── src/
│   ├── agents/              # Agentes especializados
│   │   ├── supervisor.py
│   │   ├── data_collector.py
│   │   └── image_analyzer.py
│   ├── storage/             # 🆕 Storage plugável
│   │   ├── base.py         # Interface abstrata
│   │   ├── factory.py      # Factory pattern
│   │   ├── memory.py       # Dev local
│   │   ├── redis.py        # ElastiCache
│   │   ├── dynamodb.py     # AWS DynamoDB
│   │   └── hybrid.py       # Cache + Persistência ⭐
│   ├── services/            # Serviços externos
│   │   └── transcription.py
│   ├── graph/
│   │   └── workflow.py
│   ├── models/
│   │   └── state.py
│   └── lambda_handler.py
├── docs/                    # 🆕 Documentação detalhada
│   ├── STORAGE_ARCHITECTURE.md
│   ├── STORAGE_SUMMARY.md
│   └── DOCKER_DEV.md
├── examples/                # 🆕 Exemplos de uso
│   └── storage_usage.py
├── docker-compose.yml       # 🆕 Redis local
├── requirements.txt
├── .env.example
└── README.md
```

## Instalação

1. Clone o repositório
2. Configure acesso ao AWS Bedrock (veja `BEDROCK_SETUP.md`)
3. Copie `.env.example` para `.env` e configure as variáveis
4. Instale as dependências (recomenda-se Python 3.11 para compatibilidade):

```bash
# se já tiver um venv ativo, desative primeiro
deactivate

# crie um ambiente com Python 3.11 (Windows)
py -3.11 -m venv venv
\.\venv\Scripts\Activate.ps1

# atualize o pip e instale as dependências
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Configuração de Storage

### Desenvolvimento Local (Memory)
```bash
# .env
STORAGE_BACKEND=memory
```

### Desenvolvimento com Redis
```bash
# 1. Inicia Redis local com Docker
docker-compose up -d redis

# 2. Configura .env
STORAGE_BACKEND=redis
CACHE_ENDPOINT=localhost
CACHE_PORT=6379
```

### Produção (Hybrid)
```bash
STORAGE_BACKEND=hybrid
CACHE_ENDPOINT=my-redis.cache.amazonaws.com
SESSIONS_TABLE_NAME=triagem-sessions-prod
CACHE_TTL=3600
```

📖 [Guia completo de Storage](docs/STORAGE_ARCHITECTURE.md)

## Uso Local

```bash
# Testa o handler
python src/lambda_handler.py

# Testa storage
python examples/storage_usage.py
```

## Deploy na AWS

1. Configure AWS CLI
2. Crie um layer com as dependências
3. Deploy da função Lambda

## Configuração

Variáveis de ambiente necessárias:
- `AWS_REGION`: Região AWS com Bedrock habilitado (padrão: us-east-1)
- `AWS_PROFILE`: (Opcional) Nome do perfil SSO configurado
- `BEDROCK_MODEL_ID`: ID do modelo Bedrock (padrão: anthropic.claude-3-5-sonnet-20240620-v1:0)
- `BUCKET_NAME`: (Opcional) Bucket S3 para áudios temporários
        
**Para SSO**: Configure usando `aws configure sso` e faça login com `aws sso login --profile seu-perfil`

**Importante**: Solicite acesso ao Claude 3.5 Sonnet no console do Bedrock antes de usar.

## Documentação Adicional

- 📖 [Onboarding](docs/ONBOARDING.md) - Sistema de coleta de dados médicos básicos 🆕
- 📖 [Análise de Imagens](docs/IMAGE_ANALYSIS.md) - Como enviar fotos, exames e documentos médicos
- 📖 [Transcrição de Áudio](docs/AUDIO_TRANSCRIPTION.md) - Como enviar mensagens de voz
- 📖 [Política LGPD](docs/LGPD_RETENTION_POLICY.md) - Conformidade com proteção de dados
- 📖 [Integração NestJS](docs/NESTJS_INTEGRATION.md) - Como integrar com backend NestJS
- 📖 [Quick Start SAM](docs/SAM_QUICKSTART.md) - Deploy rápido com AWS SAM

## Testes

```bash
# Teste interativo com onboarding
python test_cli.py

# Teste automatizado de onboarding
python test_onboarding.py
```

📖 [Guia completo de testes](TEST_ONBOARDING.md)
