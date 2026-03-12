#!/bin/bash
# Script de deploy manual para ambiente HML
# Uso: ./scripts/deploy-hml.sh [frontend|backend|platform|chat|all]

set -e

PROFILE="skopia"
REGION="us-east-1"
ECR_REGISTRY="416684166863.dkr.ecr.us-east-1.amazonaws.com"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Login no ECR
ecr_login() {
    log_info "Fazendo login no ECR ($REGION)..."
    aws ecr get-login-password --profile $PROFILE --region $REGION | \
        docker login --username AWS --password-stdin $ECR_REGISTRY
}

# Deploy Frontend
deploy_frontend() {
    log_info "=== Deploying Frontend HML ==="
    
    cd ../trya-frontend
    
    # Criar .env.production
    cat > .env.production << 'EOF'
NEXT_PUBLIC_API_BASE_URL=https://api-hml.trya.ai
NEXT_PUBLIC_PLATFORM_API_BASE_URL=https://platform-hml.trya.ai
NODE_ENV=production
EOF
    
    log_info "Buildando imagem Docker (linux/amd64)..."
    docker build --platform linux/amd64 -t $ECR_REGISTRY/trya-hml-frontend:latest .
    
    log_info "Pushing para ECR..."
    docker push $ECR_REGISTRY/trya-hml-frontend:latest
    
    log_info "Forçando deploy no ECS..."
    aws ecs update-service --profile $PROFILE --region $REGION \
        --cluster Trya-hml-fe-cluster \
        --service Trya-hml-fe-service \
        --force-new-deployment \
        --query 'service.{Status:status}' --output text
    
    log_info "Frontend deploy iniciado!"
    cd - > /dev/null
}

# Deploy Backend
deploy_backend() {
    log_info "=== Deploying Backend HML ==="
    
    cd ../handslab-trya-backend
    
    log_info "Buildando imagem Docker (linux/amd64)..."
    docker build --platform linux/amd64 -t $ECR_REGISTRY/trya-hml-backend:latest .
    
    log_info "Pushing para ECR..."
    docker push $ECR_REGISTRY/trya-hml-backend:latest
    
    log_info "Forçando deploy no ECS..."
    aws ecs update-service --profile $PROFILE --region $REGION \
        --cluster Trya-hml-v2-cluster \
        --service Trya-hml-v2-service \
        --force-new-deployment \
        --query 'service.{Status:status}' --output text
    
    log_info "Backend deploy iniciado!"
    cd - > /dev/null
}

# Deploy Platform
deploy_platform() {
    log_info "=== Deploying Platform HML ==="
    
    cd ../handslab-trya-platform-backend
    
    log_info "Buildando imagem Docker (linux/amd64)..."
    docker build --platform linux/amd64 -t $ECR_REGISTRY/trya-hml-platform:latest .
    
    log_info "Pushing para ECR..."
    docker push $ECR_REGISTRY/trya-hml-platform:latest
    
    log_info "Forçando deploy no ECS..."
    aws ecs update-service --profile $PROFILE --region $REGION \
        --cluster Trya-hml-plat-cluster \
        --service Trya-hml-plat-service \
        --force-new-deployment \
        --query 'service.{Status:status}' --output text
    
    log_info "Platform deploy iniciado!"
    cd - > /dev/null
}

# Deploy Chat
deploy_chat() {
    log_info "=== Deploying Chat HML ==="
    
    cd ../handslab-trya-chat-backend
    
    log_info "Buildando imagem Docker (linux/amd64)..."
    docker build --platform linux/amd64 -t $ECR_REGISTRY/trya-hml-chat:latest .
    
    log_info "Pushing para ECR..."
    docker push $ECR_REGISTRY/trya-hml-chat:latest
    
    log_info "Forçando deploy no ECS..."
    aws ecs update-service --profile $PROFILE --region $REGION \
        --cluster Trya-hml-chat-cluster \
        --service Trya-hml-chat-service \
        --force-new-deployment \
        --query 'service.{Status:status}' --output text
    
    log_info "Chat deploy iniciado!"
    cd - > /dev/null
}

# Status dos serviços
check_status() {
    log_info "=== Status dos Serviços HML ==="
    
    for cluster in "Trya-hml-v2-cluster" "Trya-hml-fe-cluster" "Trya-hml-plat-cluster" "Trya-hml-chat-cluster"; do
        service=$(aws ecs list-services --profile $PROFILE --region $REGION \
            --cluster "$cluster" --query 'serviceArns[0]' --output text 2>/dev/null | awk -F/ '{print $NF}')
        
        if [ "$service" != "None" ] && [ -n "$service" ]; then
            status=$(aws ecs describe-services --profile $PROFILE --region $REGION \
                --cluster "$cluster" --services "$service" \
                --query 'services[0].{Running:runningCount,Desired:desiredCount}' --output text 2>/dev/null)
            echo "  $service: $status"
        fi
    done
}

# Main
case "${1:-status}" in
    frontend)
        ecr_login
        deploy_frontend
        ;;
    backend)
        ecr_login
        deploy_backend
        ;;
    platform)
        ecr_login
        deploy_platform
        ;;
    chat)
        ecr_login
        deploy_chat
        ;;
    all)
        ecr_login
        deploy_backend
        deploy_frontend
        deploy_platform
        deploy_chat
        ;;
    status)
        check_status
        ;;
    *)
        echo "Uso: $0 [frontend|backend|platform|chat|all|status]"
        exit 1
        ;;
esac

log_info "Concluído!"
