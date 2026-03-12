# Guia Rápido: Instalação e Deploy do SAM CLI

## 📦 Passo 1: Instalação

O download do instalador foi iniciado automaticamente. Quando abrir:

1. Execute o arquivo `AWS_SAM_CLI_64_PY3.msi`
2. Siga o assistente de instalação (Next → Next → Install)
3. **IMPORTANTE**: Feche e reabra o terminal PowerShell após a instalação

## ✅ Passo 2: Verificação

Após reabrir o terminal:

```powershell
# Ative o ambiente virtual
& C:\projetos\pessoal\langchain-aws\venv\Scripts\Activate.ps1

# Verifique a instalação
sam --version
# Esperado: SAM CLI, version 1.x.x
```

## 🏗️ Passo 3: Build

```powershell
sam build
```

**O que faz**: 
- Instala dependências do `requirements.txt`
- Prepara o código Lambda para deploy
- Cria pasta `.aws-sam/build/`

## 🚀 Passo 4: Deploy (Primeira Vez)

```powershell
sam deploy --guided
```

**Perguntas que serão feitas**:

```
Stack Name: triagem-saude
AWS Region: us-east-1 (ou sua região preferida)
Parameter BedrockModelId: anthropic.claude-3-5-sonnet-20240620-v1:0
Confirm changes before deploy: Y
Allow SAM CLI IAM role creation: Y
Disable rollback: N
Save arguments to configuration file: Y
SAM configuration file: samconfig.toml
SAM configuration environment: default
```

## 📊 Passo 5: Teste da API

Após o deploy, você receberá uma URL:

```
Outputs:
TriagemSaudeApi: https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/Prod/triagem/
```

Teste com PowerShell:

```powershell
$apiUrl = "https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/Prod/triagem"

# Primeira mensagem
$body = @{
    message = "estou com febre alta"
    session_id = "test-123"
} | ConvertTo-Json

Invoke-RestMethod -Uri $apiUrl -Method POST -ContentType "application/json" -Body $body
```

## 🔄 Deploys Subsequentes

Após o primeiro deploy (guided):

```powershell
# Build
sam build

# Deploy (usa configurações salvas)
sam deploy
```

## 🐛 Troubleshooting

### Erro: "sam: command not found"
- Feche e reabra o terminal
- Ou adicione ao PATH manualmente: `C:\Program Files\Amazon\AWSSAMCLI\bin\`

### Erro: "AWS credentials not found"
```powershell
aws configure
# Digite suas credenciais AWS
```

### Erro: "Unable to upload artifact"
- Verifique permissões S3
- SAM criará um bucket automaticamente no primeiro deploy

### Erro durante build: "Unable to import module"
- Verifique se `requirements.txt` está completo
- Execute: `pip install -r requirements.txt` localmente para testar

## 📝 Arquivos Importantes

Após o primeiro deploy, será criado:

**samconfig.toml**: Configurações salvas
```toml
[default.deploy.parameters]
stack_name = "triagem-saude"
region = "us-east-1"
capabilities = "CAPABILITY_IAM"
```

## 🧹 Deletar Stack (Se Necessário)

```powershell
sam delete
```

## 🔍 Logs em Tempo Real

```powershell
# Ver logs da Lambda
sam logs -n TriagemSaudeFunction --tail

# Ou via AWS CLI
aws logs tail /aws/lambda/triagem-saude-agente --follow
```

## ⚡ Teste Local (Antes do Deploy)

```powershell
# Inicia API Gateway local
sam local start-api

# Em outro terminal, teste
curl http://localhost:3000/triagem -Method POST -Body '{"message": "teste", "session_id": "local"}'
```

---

**Próximo passo**: Aguarde a instalação finalizar, feche/reabra o terminal, e execute `sam --version` para confirmar.
