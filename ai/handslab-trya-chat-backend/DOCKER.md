# 🐳 Docker Setup - NestJS AWS Bedrock Chat

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Credenciais AWS configuradas
- Variáveis de ambiente AWS configuradas

## 🚀 Execução Local com Docker

### 1. **Desenvolvimento (Hot Reload)**

```bash
# Configurar variáveis de ambiente
cp .env.docker .env

# Editar .env com suas credenciais AWS
# AWS_AGENT_ID=seu-agent-id
# AWS_AGENT_ALIAS_ID=seu-agent-alias-id

# Executar em modo desenvolvimento
npm run docker:dev

# Ou diretamente
docker-compose up --build
```

**Acesso:**
**Acesso:**
- Aplicação: http://localhost:3000
- Chat WebSocket: http://localhost:3000/chat-websocket.html
- Health Check (app): http://localhost:3000/status

### 2. **Produção Local**

```bash
# Build e execução em modo produção
# Application health
curl http://localhost:3000/status

# Ou diretamente
docker-compose -f docker-compose.prod.yml up --build
```

### 3. **Comandos Úteis**

```bash

## 🔧 Variáveis de Ambiente Relevantes

- AWS_REGION (ex: us-east-1)
- AWS_RUNTIME (aws | local) — local usa credenciais via ~/.aws
- AWS_PROFILE (apenas para runtime=local)
- AWS_AGENT_ID, AWS_AGENT_ALIAS_ID
- BEDROCK_REQUESTS_PER_MINUTE (padrão 4)
# Build apenas da imagem
npm run docker:build

# Executar container individual
npm run docker:run

# Ver logs
npm run docker:logs

# Parar containers
npm run docker:stop

# Limpar containers e imagens
docker-compose down --rmi all
docker system prune -f
```

## ☁️ Deploy na AWS

### 1. **AWS ECS (Recomendado)**

```bash
# Build para produção
docker build -t nestjs-bedrock .

# Tag para ECR
docker tag nestjs-bedrock:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/nestjs-bedrock:latest

# Push para ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/nestjs-bedrock:latest
```

### 2. **AWS Lambda (Container)**

```bash
# Build para Lambda
docker build -t nestjs-bedrock-lambda -f Dockerfile.lambda .
```

### 3. **EC2 com Docker**

```bash
# No servidor EC2
git clone <seu-repo>
cd nestjs-awsbedrock/00-basic-chatbot

# Configurar variáveis de ambiente
sudo cp .env.docker .env
sudo nano .env  # Editar credenciais

# Executar
sudo docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuração de Variáveis AWS

### Opção 1: Arquivo .env
```bash
AWS_REGION=us-east-1
AWS_AGENT_ID=ABCDEFGHIJ
AWS_AGENT_ALIAS_ID=TSTALIASID
```

### Opção 2: IAM Role (Recomendado na AWS)
- Configure IAM Role com permissões Bedrock
- Attach role ao ECS Task ou EC2 Instance

### Opção 3: AWS Credentials
```bash
# Montar credentials no container
-v ~/.aws:/home/nestjs/.aws:ro
```

## 📊 Monitoramento

### Health Checks
```bash
# Application health
curl http://localhost:3000/chat/health

# Container health
docker ps --filter "health=healthy"
```

### Logs
```bash
# Logs em tempo real
docker-compose logs -f

# Logs específicos do NestJS
docker-compose logs -f nestjs-app
```

## 🔒 Segurança

### 1. **Produção**
- Use secrets manager para credenciais AWS
- Configure HTTPS/TLS
- Limite CORS origins
- Use IAM roles em vez de access keys

### 2. **Nginx**
- Rate limiting configurado
- Security headers
- Gzip compression
- Static file caching

## 🐛 Troubleshooting

### Container não inicia
```bash
# Verificar logs
docker-compose logs nestjs-app

# Verificar variáveis de ambiente
docker-compose exec nestjs-app env | grep AWS
```

### Erro de conexão AWS
```bash
# Testar credenciais AWS no container
docker-compose exec nestjs-app aws sts get-caller-identity
```

### WebSocket não funciona
- Verificar se porta 3000 está exposta
- Confirmar se nginx está roteando WebSocket corretamente
- Verificar CORS settings

## 📝 Estrutura dos Arquivos

```
├── Dockerfile              # Produção multi-stage
├── Dockerfile.dev          # Desenvolvimento com hot reload
├── docker-compose.yml      # Desenvolvimento local
├── docker-compose.prod.yml # Produção local
├── .dockerignore           # Arquivos ignorados no build
├── .env.docker            # Template de variáveis
└── docker/
    ├── nginx.conf         # Configuração Nginx desenvolvimento
    └── nginx.prod.conf    # Configuração Nginx produção
```