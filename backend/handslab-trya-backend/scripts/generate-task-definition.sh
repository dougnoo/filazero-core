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
  # Cognito HML - Pool trigo-hml-v3 em us-east-1
  DEFAULT_COGNITO_USER_POOL_ID="us-east-1_ydSRKIYWa"
  DEFAULT_COGNITO_CLIENT_ID="5c5cbaktsbscjf5dbujthbneor"
  DEFAULT_S3_ASSETS_BASE_URL="https://hml-app.trya.ai"
  DEFAULT_PLATFORM_API_URL="https://platform-hml.trya.ai"
else
  # DEV defaults
  # Cognito DEV - Pool trigo em us-east-1
  DEFAULT_COGNITO_USER_POOL_ID="us-east-1_Brw5t4pXW"
  DEFAULT_COGNITO_CLIENT_ID="5glp5r6o91vdmusvaa4quued58"
  DEFAULT_S3_ASSETS_BASE_URL="https://app.trya.ai"
  DEFAULT_PLATFORM_API_URL="https://platform-dev.trya.ai"
fi

# Set default values for optional variables
export TASK_DEFINITION="${TASK_DEFINITION:-trya-backend-task}"
export LOG_REGION="${LOG_REGION:-$AWS_REGION}"
export API_PORT="${API_PORT:-3000}"
export API_CPU="${API_CPU:-512}"
export API_MEMORY="${API_MEMORY:-1024}"
export NODE_ENV="${NODE_ENV:-development}"
export OTP_STORAGE="${OTP_STORAGE:-dynamodb}"
export NOTIFICATION_SERVICE="${NOTIFICATION_SERVICE:-ses}"
export IMAGE_NAME="${IMAGE_NAME:-$ECR_REPOSITORY}"
export CONTAINER_NAME="${CONTAINER_NAME:-$ECR_REPOSITORY}"
export IMAGE_TAG_FOR_TASK="${IMAGE_TAG_FOR_TASK:-latest}"

# Build DATABASE_URL with actual values
export POSTGRES_PORT="${POSTGRES_PORT:-5432}"
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"

# ElastiCache configuration
export ELASTICACHE_PORT="${ELASTICACHE_PORT:-6379}"
export ELASTICACHE_TLS="${ELASTICACHE_TLS:-true}"

# S3 Assets defaults
export AWS_S3_ASSETS_BASE_URL="${AWS_S3_ASSETS_BASE_URL:-$DEFAULT_S3_ASSETS_BASE_URL}"

# Contact email default
export CONTACT_TO_EMAIL="${CONTACT_TO_EMAIL:-contato@trya.health}"

# Platform API URL default
export TRYA_PLATFORM_API_URL="${TRYA_PLATFORM_API_URL:-$DEFAULT_PLATFORM_API_URL}"

# Cognito defaults - Pool específico por ambiente
export COGNITO_USER_POOL_ID="${COGNITO_USER_POOL_ID:-$DEFAULT_COGNITO_USER_POOL_ID}"
export COGNITO_CLIENT_ID="${COGNITO_CLIENT_ID:-$DEFAULT_COGNITO_CLIENT_ID}"
export COGNITO_CLIENT_SECRET="${COGNITO_CLIENT_SECRET:-}"
export COGNITO_REGION="${COGNITO_REGION:-us-east-1}"

# Debug: Show key variables
echo "📋 Configuration:"
echo "   IMAGE_NAME: $IMAGE_NAME"
echo "   ECR_REGISTRY: $ECR_REGISTRY"
echo "   ECR_REPOSITORY: $ECR_REPOSITORY"
echo "   ECS_CLUSTER: $ECS_CLUSTER"
echo "   AWS_REGION: $AWS_REGION"
echo "   LOG_REGION: $LOG_REGION"
echo "   POSTGRES_HOST: $POSTGRES_HOST"
echo "   ELASTICACHE_HOST: ${ELASTICACHE_HOST:-<not configured>}"
echo "   ELASTICACHE_PORT: $ELASTICACHE_PORT"
echo "   ELASTICACHE_TLS: $ELASTICACHE_TLS"
echo ""

# Replace variables in template
envsubst < task-definition.template > task-definition.json

echo "✅ task-definition.json generated successfully!"
echo ""
echo "---- task-definition.json ----"
cat task-definition.json
echo ""
echo "------------------------------"
