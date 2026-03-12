#!/bin/bash

# ==============================================================================
# Import Script - DEV Environment
# ==============================================================================
# Este script importa os recursos AWS existentes para o Terraform
# Execute a partir da raiz do repositório handslab-trya-infra
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENVIRONMENT="dev"
AWS_PROFILE="skopia"
AWS_REGION="sa-east-1"

# IDs de recursos existentes (DEV - sa-east-1)
VPC_ID="vpc-0f2ade875bf5be1b8"
IGW_ID="igw-0f85d8dae3e635b5b"
NAT_GW_ID="nat-05a192d674f326dd9"

# Subnets Públicas
PUBLIC_SUBNET_1="subnet-052c9bf6a938c0869"  # sa-east-1a
PUBLIC_SUBNET_2="subnet-0ffcaa0ac21610946"  # sa-east-1b
PUBLIC_SUBNET_3="subnet-02018b65ad5b3992b"  # sa-east-1c

# Subnets Privadas
PRIVATE_SUBNET_1="subnet-042dd02b950e02873"  # sa-east-1a
PRIVATE_SUBNET_2="subnet-09a735a0d762ea9c8"  # sa-east-1b
PRIVATE_SUBNET_3="subnet-0c95acd17348df5df"  # sa-east-1c

# Route Tables
PUBLIC_RT="rtb-07fcc91dc8af6df93"
PRIVATE_RT="rtb-024888b92d5d772ad"

# Route53
HOSTED_ZONE_ID="Z0174021443SX63ON0KA"

# ECS/ALB - Backend
BACKEND_ECR="trya-dev-backend"
BACKEND_CLUSTER="Trya-dev-cluster"
BACKEND_SERVICE="Trya-dev-service"
BACKEND_ALB_ARN="arn:aws:elasticloadbalancing:sa-east-1:416684166863:loadbalancer/app/Trya-dev-alb/5846981b4017381c"
BACKEND_TG_ARN="arn:aws:elasticloadbalancing:sa-east-1:416684166863:targetgroup/Trya-dev-tg/710320a64ed84501"

# ECS/ALB - Frontend
FRONTEND_ECR="trya-frontend-dev"
FRONTEND_CLUSTER="trya-frontend-dev-cluster"
FRONTEND_SERVICE="trya-frontend-dev-service"
FRONTEND_ALB_ARN="arn:aws:elasticloadbalancing:sa-east-1:416684166863:loadbalancer/app/trya-frontend-dev-alb/9822a9784a641f65"
FRONTEND_TG_ARN="arn:aws:elasticloadbalancing:sa-east-1:416684166863:targetgroup/trya-frontend-dev-alb/bfcace52f81368b5"

# RDS
RDS_INSTANCE_ID="db-trya-dev-postgres"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Import de Recursos - DEV${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

import_resource() {
    local stack=$1
    local resource_addr=$2
    local resource_id=$3
    
    echo -e "${YELLOW}Importando: ${resource_addr}${NC}"
    
    cd "stacks/${stack}"
    
    # Inicializar se necessário
    if [ ! -d ".terraform" ]; then
        echo -e "  Inicializando Terraform..."
        terraform init -backend-config="../../environments/${ENVIRONMENT}/${stack}.backend.conf" > /dev/null 2>&1
    fi
    
    # Tentar import
    if terraform import -var-file="../../environments/${ENVIRONMENT}/${stack}.tfvars" "${resource_addr}" "${resource_id}" 2>/dev/null; then
        echo -e "${GREEN}  Importado com sucesso${NC}"
    else
        echo -e "${RED}  Falha no import (recurso pode já estar no state ou não existir)${NC}"
    fi
    
    cd ../..
}

# ==============================================================================
# NETWORK STACK
# ==============================================================================
import_network() {
    echo ""
    echo -e "${BLUE}--- Network Stack ---${NC}"
    
    # Este stack precisa ser adaptado para import
    # Os recursos de network geralmente precisam de import manual cuidadoso
    echo -e "${YELLOW}NOTA: O import do network stack requer configuração manual.${NC}"
    echo -e "${YELLOW}Consulte IMPORT_GUIDE.md para instruções detalhadas.${NC}"
}

# ==============================================================================
# BACKEND STACK
# ==============================================================================
import_backend() {
    echo ""
    echo -e "${BLUE}--- Backend Stack ---${NC}"
    
    # ECR
    import_resource "backend" 'module.ecr.aws_ecr_repository.main["backend"]' "${BACKEND_ECR}"
    
    # ECS Cluster
    import_resource "backend" "module.ecs_service.aws_ecs_cluster.main" "${BACKEND_CLUSTER}"
    
    # ALB
    import_resource "backend" "module.ecs_service.aws_lb.main" "${BACKEND_ALB_ARN}"
    
    # Target Group
    import_resource "backend" "module.ecs_service.aws_lb_target_group.main" "${BACKEND_TG_ARN}"
    
    # RDS
    import_resource "backend" "module.rds.aws_db_instance.main" "${RDS_INSTANCE_ID}"
    
    # Route53 Record
    import_resource "backend" "aws_route53_record.backend" "${HOSTED_ZONE_ID}_api-dev.trya.com.br_A"
}

# ==============================================================================
# FRONTEND STACK
# ==============================================================================
import_frontend() {
    echo ""
    echo -e "${BLUE}--- Frontend Stack ---${NC}"
    
    # ECR
    import_resource "frontend" 'module.ecr.aws_ecr_repository.main["frontend"]' "${FRONTEND_ECR}"
    
    # ECS Cluster
    import_resource "frontend" "module.ecs_service.aws_ecs_cluster.main" "${FRONTEND_CLUSTER}"
    
    # ALB
    import_resource "frontend" "module.ecs_service.aws_lb.main" "${FRONTEND_ALB_ARN}"
    
    # Target Group
    import_resource "frontend" "module.ecs_service.aws_lb_target_group.main" "${FRONTEND_TG_ARN}"
}

# ==============================================================================
# MAIN
# ==============================================================================
case "${1:-all}" in
    network)
        import_network
        ;;
    backend)
        import_backend
        ;;
    frontend)
        import_frontend
        ;;
    all)
        import_network
        import_backend
        import_frontend
        ;;
    *)
        echo "Usage: $0 [network|backend|frontend|all]"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Import concluído!${NC}"
echo -e "${YELLOW}Execute 'terraform plan' em cada stack para verificar o estado.${NC}"
