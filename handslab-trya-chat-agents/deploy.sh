#!/bin/bash
# Script para fazer deploy da Lambda na AWS usando SAM

# Verifica se AWS CLI está instalado
if ! command -v sam &> /dev/null
then
    echo "❌ AWS SAM CLI não encontrado. Instale em: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
    exit 1
fi

echo "🚀 Iniciando deploy da Lambda..."

# Build
echo "📦 Building application..."
sam build

# Deploy
echo "☁️  Deploying to AWS..."
sam deploy \
    --guided \
    --stack-name triagem-saude-stack \
    --capabilities CAPABILITY_IAM \
    --region us-east-1

echo "✅ Deploy concluído!"
