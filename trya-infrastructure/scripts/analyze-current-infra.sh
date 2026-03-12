#!/bin/bash
# =============================================================================
# Script de Análise de Infraestrutura AWS vs Terraform
# =============================================================================

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     ANÁLISE DE INFRAESTRUTURA AWS - TRYA                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Função para verificar recursos em uma região
check_region() {
    local PROFILE=$1
    local REGION=$2
    local ENV=$3
    
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Ambiente: ${ENV} | Região: ${REGION} | Profile: ${PROFILE}${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # VPCs
    echo -e "${GREEN}📡 VPCs:${NC}"
    aws ec2 describe-vpcs \
        --region $REGION \
        --profile $PROFILE \
        --query 'Vpcs[*].[VpcId,CidrBlock,Tags[?Key==`Name`].Value|[0]]' \
        --output table 2>/dev/null || echo "  ❌ Erro ao listar VPCs"
    echo ""
    
    # ECS Clusters
    echo -e "${GREEN}🐳 ECS Clusters:${NC}"
    aws ecs list-clusters \
        --region $REGION \
        --profile $PROFILE \
        --query 'clusterArns[*]' \
        --output table 2>/dev/null || echo "  ❌ Erro ao listar clusters"
    echo ""
    
    # ECS Services
    echo -e "${GREEN}⚙️  ECS Services:${NC}"
    CLUSTERS=$(aws ecs list-clusters --region $REGION --profile $PROFILE --query 'clusterArns[*]' --output text 2>/dev/null)
    if [ ! -z "$CLUSTERS" ]; then
        for CLUSTER in $CLUSTERS; do
            echo "  Cluster: $(basename $CLUSTER)"
            aws ecs list-services \
                --cluster $CLUSTER \
                --region $REGION \
                --profile $PROFILE \
                --query 'serviceArns[*]' \
                --output text 2>/dev/null | xargs -n1 basename || echo "    Nenhum serviço"
        done
    else
        echo "  Nenhum cluster encontrado"
    fi
    echo ""
    
    # ECR Repositories
    echo -e "${GREEN}📦 ECR Repositories:${NC}"
    aws ecr describe-repositories \
        --region $REGION \
        --profile $PROFILE \
        --query 'repositories[*].[repositoryName,repositoryUri]' \
        --output table 2>/dev/null || echo "  ❌ Erro ao listar repositórios"
    echo ""
    
    # RDS/Aurora Clusters
    echo -e "${GREEN}🗄️  RDS/Aurora Clusters:${NC}"
    aws rds describe-db-clusters \
        --region $REGION \
        --profile $PROFILE \
        --query 'DBClusters[*].[DBClusterIdentifier,Engine,Status,Endpoint]' \
        --output table 2>/dev/null || echo "  ❌ Erro ao listar clusters Aurora"
    echo ""
    
    # DynamoDB Tables
    echo -e "${GREEN}📊 DynamoDB Tables:${NC}"
    aws dynamodb list-tables \
        --region $REGION \
        --profile $PROFILE \
        --query 'TableNames[*]' \
        --output table 2>/dev/null || echo "  ❌ Erro ao listar tabelas"
    echo ""
    
    # ElastiCache
    echo -e "${GREEN}⚡ ElastiCache:${NC}"
    aws elasticache describe-cache-clusters \
        --region $REGION \
        --profile $PROFILE \
        --query 'CacheClusters[*].[CacheClusterId,Engine,CacheNodeType,CacheClusterStatus]' \
        --output table 2>/dev/null || echo "  ❌ Erro ao listar cache clusters"
    
    # ElastiCache Serverless
    aws elasticache describe-serverless-caches \
        --region $REGION \
        --profile $PROFILE \
        --query 'ServerlessCaches[*].[ServerlessCacheName,Engine,Status]' \
        --output table 2>/dev/null || echo "  (Serverless não disponível ou sem caches)"
    echo ""
    
    # Lambda Functions
    echo -e "${GREEN}λ Lambda Functions:${NC}"
    aws lambda list-functions \
        --region $REGION \
        --profile $PROFILE \
        --query 'Functions[*].[FunctionName,Runtime,LastModified]' \
        --output table 2>/dev/null || echo "  ❌ Erro ao listar functions"
    echo ""
    
    # ALBs
    echo -e "${GREEN}⚖️  Application Load Balancers:${NC}"
    aws elbv2 describe-load-balancers \
        --region $REGION \
        --profile $PROFILE \
        --query 'LoadBalancers[*].[LoadBalancerName,DNSName,State.Code]' \
        --output table 2>/dev/null || echo "  ❌ Erro ao listar ALBs"
    echo ""
    
    # S3 Buckets (global, mas filtrar por região se possível)
    echo -e "${GREEN}🪣 S3 Buckets (sample):${NC}"
    aws s3api list-buckets \
        --profile $PROFILE \
        --query 'Buckets[?contains(Name, `trya`) || contains(Name, `triagem`)].Name' \
        --output table 2>/dev/null || echo "  ❌ Erro ao listar buckets"
    echo ""
    
    # Cognito User Pools
    echo -e "${GREEN}🔐 Cognito User Pools:${NC}"
    aws cognito-idp list-user-pools \
        --max-results 10 \
        --region $REGION \
        --profile $PROFILE \
        --query 'UserPools[*].[Name,Id,CreationDate]' \
        --output table 2>/dev/null || echo "  ❌ Erro ao listar user pools"
    echo ""
    
    # WAF Web ACLs
    echo -e "${GREEN}🛡️  WAF Web ACLs:${NC}"
    aws wafv2 list-web-acls \
        --scope REGIONAL \
        --region $REGION \
        --profile $PROFILE \
        --query 'WebACLs[*].[Name,Id]' \
        --output table 2>/dev/null || echo "  ❌ Erro ao listar WAF ACLs"
    echo ""
}

# Verificar ambientes
echo -e "${BLUE}Verificando ambientes provisionados...${NC}"
echo ""

# Ambiente DEV (us-east-1)
if aws sts get-caller-identity --profile skopia &>/dev/null; then
    check_region "skopia" "us-east-1" "DEV"
else
    echo -e "${RED}❌ Profile 'skopia' não configurado ou sem acesso${NC}"
    echo ""
fi

# Ambiente HML (sa-east-1)
if aws sts get-caller-identity --profile skopia &>/dev/null; then
    check_region "skopia" "sa-east-1" "HML"
else
    echo -e "${RED}❌ Profile 'skopia' não configurado ou sem acesso${NC}"
    echo ""
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    ANÁLISE CONCLUÍDA                           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
