#!/bin/bash

# =============================================================================
# Generate task-definition.json from template
# =============================================================================
# Suporta ambientes: dev (default), hml/staging
#
# Para usar HML, defina: ENVIRONMENT=hml ou ENVIRONMENT=staging
# =============================================================================

set -e

echo "🔧 Generating task-definition.json..."
echo ""

# =============================================================================
# Detectar ambiente: dev (default) ou hml/staging
# =============================================================================
ENV="${ENVIRONMENT:-dev}"
if [[ "$ENV" == "staging" ]]; then
  ENV="hml"
fi

echo "🌍 Environment detected: $ENV"
echo ""

# =============================================================================
# Defaults por ambiente
# =============================================================================
if [[ "$ENV" == "hml" ]]; then
  # HML/Staging defaults
  DEFAULT_DB_HOST="trya-backend-hml-aurora.cluster-xxx.sa-east-1.rds.amazonaws.com"
  DEFAULT_DB_SCHEMA="platform_hml"
  DEFAULT_CORS_ORIGIN="http://localhost:3000,https://hml-app.trya.ai"
  DEFAULT_FRONTEND_URL="https://hml-app.trya.ai"
  # Cognito HML - Pool trigo-hml-v3 em us-east-1
  DEFAULT_COGNITO_USER_POOL_ID="us-east-1_ydSRKIYWa"
  DEFAULT_COGNITO_CLIENT_ID="5c5cbaktsbscjf5dbujthbneor"
  DEFAULT_S3_BUCKET="trya-platform-files-hml"
  DEFAULT_DYNAMODB_OTP_TABLE="platform-otp-codes-hml"
  DEFAULT_TRYA_ASSETS_BUCKET="trya-assets-hml"
  DEFAULT_ASSETS_CDN_URL="https://hml-app.trya.ai"
else
  # DEV defaults
  DEFAULT_DB_HOST="trya-backend-dev-aurora.cluster-c0l4y2syc0wl.us-east-1.rds.amazonaws.com"
  DEFAULT_DB_SCHEMA="platform_dev"
  DEFAULT_CORS_ORIGIN="http://localhost:3000,https://dev-app.trya.ai"
  DEFAULT_FRONTEND_URL="https://dev-app.trya.ai"
  # Cognito DEV - Pool trigo em us-east-1
  DEFAULT_COGNITO_USER_POOL_ID="us-east-1_Brw5t4pXW"
  DEFAULT_COGNITO_CLIENT_ID="5glp5r6o91vdmusvaa4quued58"
  DEFAULT_S3_BUCKET="trya-platform-files"
  DEFAULT_DYNAMODB_OTP_TABLE="platform-otp-codes"
  DEFAULT_TRYA_ASSETS_BUCKET="broker-tenant-1"
  DEFAULT_ASSETS_CDN_URL="https://app.trya.ai"
fi

# Set default values for optional variables
export LOG_REGION="${LOG_REGION:-$AWS_REGION}"
export API_PORT="${API_PORT:-3000}"
export API_CPU="${API_CPU:-512}"
export API_MEMORY="${API_MEMORY:-1024}"
export NODE_ENV="${NODE_ENV:-production}"
export NOTIFICATION_SERVICE="${NOTIFICATION_SERVICE:-ses}"
export IMAGE_NAME="${IMAGE_NAME:-$ECR_REGISTRY/$ECR_REPOSITORY:latest}"
export CONTAINER_NAME="${CONTAINER_NAME:-$ECR_REPOSITORY}"

# Database defaults
export DB_HOST="${DB_HOST:-$DEFAULT_DB_HOST}"
export DB_PORT="${DB_PORT:-5432}"
export DB_USERNAME="${DB_USERNAME:-postgres}"
export DB_PASSWORD="${DB_PASSWORD}"
export DB_NAME="${DB_NAME:-trya}"
export DB_SCHEMA="${DB_SCHEMA:-$DEFAULT_DB_SCHEMA}"

# JWT defaults
export JWT_SECRET="${JWT_SECRET:-IlVjvtNyncvdfNiG7Fkoa8GNr4xx2yFgW1BnOuVZeW0=}"
export JWT_EXPIRATION="${JWT_EXPIRATION:-7d}"

# CORS defaults
export CORS_ORIGIN="${CORS_ORIGIN:-$DEFAULT_CORS_ORIGIN}"
export CORS_CREDENTIALS="${CORS_CREDENTIALS:-true}"
export FRONTEND_URL="${FRONTEND_URL:-$DEFAULT_FRONTEND_URL}"

# AWS SES defaults
export AWS_SES_FROM_EMAIL="${AWS_SES_FROM_EMAIL:-gustavoborges@skopiadigital.com.br}"
export AWS_SES_FROM_NAME="${AWS_SES_FROM_NAME:-Trya Health}"

# S3 defaults
export AWS_S3_BUCKET_NAME="${AWS_S3_BUCKET_NAME:-$DEFAULT_S3_BUCKET}"

# DynamoDB defaults
export DYNAMODB_OTP_TABLE_NAME="${DYNAMODB_OTP_TABLE_NAME:-$DEFAULT_DYNAMODB_OTP_TABLE}"

# Cognito defaults - Pool específico por ambiente (sempre em us-east-1)
export COGNITO_REGION="${COGNITO_REGION:-us-east-1}"
export COGNITO_USER_POOL_ID="${COGNITO_USER_POOL_ID:-$DEFAULT_COGNITO_USER_POOL_ID}"
export COGNITO_CLIENT_ID="${COGNITO_CLIENT_ID:-$DEFAULT_COGNITO_CLIENT_ID}"
export COGNITO_CLIENT_SECRET="${COGNITO_CLIENT_SECRET:-}"

# Platform API Key
export TRYA_PLATFORM_API_KEY="${TRYA_PLATFORM_API_KEY:-Tr7revjJDZJaae3Xz5G7v8K3bH9mU6nYX}"

# Memed defaults
export MEMED_API_KEY="${MEMED_API_KEY}"
export MEMED_SECRET_KEY="${MEMED_SECRET_KEY}"
export MEMED_ENVIRONMENT="${MEMED_ENVIRONMENT:-sandbox}"

# Bucket configuration defaults
export TENANT_BUCKET_SUFFIX="${TENANT_BUCKET_SUFFIX:-}"
export TRYA_ASSETS_BUCKET="${TRYA_ASSETS_BUCKET:-$DEFAULT_TRYA_ASSETS_BUCKET}"
# Escapa aspas duplas no JSON para evitar quebra no task definition
export BUCKET_REGION_MAP=$(echo "${BUCKET_REGION_MAP:-{}}" | sed 's/"/\\"/g')
export ASSETS_CDN_URL="${ASSETS_CDN_URL:-$DEFAULT_ASSETS_CDN_URL}"

export GOOGLE_PLACES_API_KEY="${GOOGLE_PLACES_API_KEY}"

export CFM_URL="${CFM_URL}"
export CFM_API_KEY="${CFM_API_KEY}"

# Debug: Show key variables
echo "📋 Configuration:"
echo "   IMAGE_NAME: $IMAGE_NAME"
echo "   CONTAINER_NAME: $CONTAINER_NAME"
echo "   ECR_REGISTRY: $ECR_REGISTRY"
echo "   ECR_REPOSITORY: $ECR_REPOSITORY"
echo "   ECS_CLUSTER: $ECS_CLUSTER"
echo "   AWS_REGION: $AWS_REGION"
echo "   LOG_REGION: $LOG_REGION"
echo "   DB_HOST: $DB_HOST"
echo "   AWS_S3_BUCKET_NAME: $AWS_S3_BUCKET_NAME"
echo ""

# Replace variables in template
envsubst < task-definition.template > task-definition.json

echo "✅ task-definition.json generated successfully!"
echo ""
echo "---- task-definition.json ----"
cat task-definition.json
echo ""
echo "------------------------------"
