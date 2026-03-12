#!/bin/bash
# =============================================================================
# Script para criar State Backend (S3 + DynamoDB) para uma conta
# =============================================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função de ajuda
usage() {
    echo "Uso: $0 <account-name> <region>"
    echo ""
    echo "Exemplos:"
    echo "  $0 admin-trya-dev us-east-1"
    echo "  $0 grupo-trigo-prod sa-east-1"
    echo ""
    echo "Este script cria:"
    echo "  - Bucket S3: tfstate-<account-name>"
    echo "  - Tabela DynamoDB: terraform-locks"
    exit 1
}

# Validar argumentos
if [ $# -ne 2 ]; then
    usage
fi

ACCOUNT_NAME=$1
REGION=$2
BUCKET_NAME="tfstate-${ACCOUNT_NAME}"
TABLE_NAME="terraform-locks"
PROFILE=$ACCOUNT_NAME

echo -e "${YELLOW}=== Criando State Backend para ${ACCOUNT_NAME} ===${NC}"
echo ""
echo "Bucket S3: ${BUCKET_NAME}"
echo "Região: ${REGION}"
echo "Profile: ${PROFILE}"
echo "Tabela DynamoDB: ${TABLE_NAME}"
echo ""

# Confirmar
read -p "Continuar? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelado."
    exit 1
fi

# Criar bucket S3
echo -e "${YELLOW}Criando bucket S3...${NC}"
if aws s3 mb "s3://${BUCKET_NAME}" --region "${REGION}" --profile "${PROFILE}"; then
    echo -e "${GREEN}✓ Bucket criado${NC}"
else
    echo -e "${RED}✗ Erro ao criar bucket (pode já existir)${NC}"
fi

# Habilitar versionamento
echo -e "${YELLOW}Habilitando versionamento...${NC}"
aws s3api put-bucket-versioning \
    --bucket "${BUCKET_NAME}" \
    --versioning-configuration Status=Enabled \
    --region "${REGION}" \
    --profile "${PROFILE}"
echo -e "${GREEN}✓ Versionamento habilitado${NC}"

# Habilitar encryption
echo -e "${YELLOW}Habilitando encryption...${NC}"
aws s3api put-bucket-encryption \
    --bucket "${BUCKET_NAME}" \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }]
    }' \
    --region "${REGION}" \
    --profile "${PROFILE}"
echo -e "${GREEN}✓ Encryption habilitado${NC}"

# Bloquear acesso público
echo -e "${YELLOW}Bloqueando acesso público...${NC}"
aws s3api put-public-access-block \
    --bucket "${BUCKET_NAME}" \
    --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
    --region "${REGION}" \
    --profile "${PROFILE}"
echo -e "${GREEN}✓ Acesso público bloqueado${NC}"

# Criar tabela DynamoDB
echo -e "${YELLOW}Criando tabela DynamoDB...${NC}"
if aws dynamodb create-table \
    --table-name "${TABLE_NAME}" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "${REGION}" \
    --profile "${PROFILE}" > /dev/null; then
    echo -e "${GREEN}✓ Tabela criada${NC}"
else
    echo -e "${RED}✗ Erro ao criar tabela (pode já existir)${NC}"
fi

echo ""
echo -e "${GREEN}=== State Backend criado com sucesso! ===${NC}"
echo ""
echo "Agora você pode fazer deploy:"
echo "  cd accounts/${ACCOUNT_NAME}/stack"
echo "  terragrunt run-all plan"
