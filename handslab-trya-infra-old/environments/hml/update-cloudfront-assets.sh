#!/bin/bash
# Script para adicionar origin de assets ao CloudFront HML
# Distribution ID: E1G0WJO2Z4WR7M

set -e

DISTRIBUTION_ID="E1G0WJO2Z4WR7M"
PROFILE="skopia"
REGION="us-east-1"

echo "🔧 Obtendo configuração atual do CloudFront..."
aws cloudfront get-distribution-config \
  --id $DISTRIBUTION_ID \
  --profile $PROFILE \
  --region $REGION \
  --output json > /tmp/cf-config.json

# Extrair ETag
ETAG=$(jq -r '.ETag' /tmp/cf-config.json)
echo "📋 ETag: $ETAG"

# Extrair configuração
jq '.DistributionConfig' /tmp/cf-config.json > /tmp/cf-dist-config.json

echo "✏️  Adicionando origin de assets..."

# Adicionar novo origin para assets
jq '.Origins.Items += [{
  "Id": "S3-assets-hml",
  "DomainName": "grupotrigo-assets-sa.s3.sa-east-1.amazonaws.com",
  "OriginPath": "",
  "CustomHeaders": {
    "Quantity": 0
  },
  "S3OriginConfig": {
    "OriginAccessIdentity": ""
  },
  "ConnectionAttempts": 3,
  "ConnectionTimeout": 10,
  "OriginShield": {
    "Enabled": false
  },
  "OriginAccessControlId": "'"$(terraform output -raw assets_oac_id)"'"
}] | .Origins.Quantity += 1' /tmp/cf-dist-config.json > /tmp/cf-dist-config-new.json

echo "✏️  Adicionando cache behavior para /assets/*..."

# Adicionar cache behavior para /assets/*
jq '.CacheBehaviors.Items += [{
  "PathPattern": "/assets/*",
  "TargetOriginId": "S3-assets-hml",
  "TrustedSigners": {
    "Enabled": false,
    "Quantity": 0
  },
  "TrustedKeyGroups": {
    "Enabled": false,
    "Quantity": 0
  },
  "ViewerProtocolPolicy": "redirect-to-https",
  "AllowedMethods": {
    "Quantity": 3,
    "Items": ["GET", "HEAD", "OPTIONS"],
    "CachedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    }
  },
  "SmoothStreaming": false,
  "Compress": true,
  "LambdaFunctionAssociations": {
    "Quantity": 0
  },
  "FunctionAssociations": {
    "Quantity": 0
  },
  "FieldLevelEncryptionId": "",
  "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
  "ResponseHeadersPolicyId": "'"$(terraform output -raw cors_policy_id)"'"
}] | .CacheBehaviors.Quantity += 1' /tmp/cf-dist-config-new.json > /tmp/cf-dist-config-final.json

echo "🚀 Atualizando CloudFront..."
aws cloudfront update-distribution \
  --id $DISTRIBUTION_ID \
  --distribution-config file:///tmp/cf-dist-config-final.json \
  --if-match $ETAG \
  --profile $PROFILE \
  --region $REGION

echo "✅ CloudFront atualizado!"
echo "⏳ Aguardando deploy (pode levar alguns minutos)..."

aws cloudfront wait distribution-deployed \
  --id $DISTRIBUTION_ID \
  --profile $PROFILE \
  --region $REGION

echo "🎉 Deploy concluído!"
echo ""
echo "📝 Próximos passos:"
echo "1. Atualizar código backend para usar: https://hml-app.trya.ai/assets/"
echo "2. Fazer deploy do backend"
echo "3. Testar: https://hml-app.trya.ai/assets/theme/logo_trigo.png"
