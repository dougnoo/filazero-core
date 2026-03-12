# Script PowerShell para fazer deploy da Lambda na AWS usando SAM

# Verifica se AWS SAM CLI está instalado
if (-not (Get-Command sam -ErrorAction SilentlyContinue)) {
    Write-Host "❌ AWS SAM CLI não encontrado. Instale em: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Iniciando deploy da Lambda..." -ForegroundColor Cyan

# Build
Write-Host "📦 Building application..." -ForegroundColor Yellow
sam build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro durante build" -ForegroundColor Red
    exit 1
}

# Deploy
Write-Host "☁️  Deploying to AWS..." -ForegroundColor Yellow
sam deploy `
    --guided `
    --stack-name triagem-saude-stack `
    --capabilities CAPABILITY_IAM `
    --region us-east-1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deploy concluído!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro durante deploy" -ForegroundColor Red
    exit 1
}
