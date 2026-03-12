#!/bin/bash

# Trya Infrastructure - Bootstrap para Conta HML
# Este script prepara uma conta AWS separada para o ambiente HML
# Deve ser executado COM CREDENCIAIS DA CONTA HML
#
# Uso:
#   ./bootstrap-hml-account.sh                    # Usa credenciais padrao
#   ./bootstrap-hml-account.sh --profile skopia   # Usa profile especifico
#   AWS_PROFILE=skopia ./bootstrap-hml-account.sh # Alternativa via env var

set -e

# Processar argumentos
AWS_PROFILE_ARG=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --profile)
            AWS_PROFILE_ARG="--profile $2"
            export AWS_PROFILE="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

echo "=========================================="
echo "  Trya - Bootstrap Conta HML"
echo "=========================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuracoes (mesmas do dev para manter consistencia)
AWS_REGION="${AWS_REGION:-sa-east-1}"
STATE_BUCKET="${STATE_BUCKET:-trya-terraform-state-hml}"
LOCK_TABLE="${LOCK_TABLE:-trya-terraform-locks-hml}"
BITBUCKET_WORKSPACE_UUID="${BITBUCKET_WORKSPACE_UUID:-}"

echo -e "${YELLOW}Configuracoes:${NC}"
echo "  Regiao: ${AWS_REGION}"
echo "  Bucket State: ${STATE_BUCKET}"
echo "  Tabela Lock: ${LOCK_TABLE}"
if [[ -n "$AWS_PROFILE" ]]; then
    echo "  AWS Profile: ${AWS_PROFILE}"
fi
echo ""

# ===========================================
# Pre-requisitos
# ===========================================
echo -e "${BLUE}[1/5] Verificando pre-requisitos...${NC}"

if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI nao encontrado. Instale-o primeiro.${NC}"
    exit 1
fi
echo -e "${GREEN}  AWS CLI encontrado${NC}"

if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Terraform nao encontrado. Instale-o primeiro.${NC}"
    exit 1
fi
echo -e "${GREEN}  Terraform encontrado${NC}"

if ! aws $AWS_PROFILE_ARG sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Credenciais AWS nao configuradas.${NC}"
    echo -e "${YELLOW}Opcoes:${NC}"
    echo "  1. Execute: aws configure"
    echo "  2. Use: ./bootstrap-hml-account.sh --profile seu-profile"
    echo "  3. Exporte: AWS_PROFILE=seu-profile ./bootstrap-hml-account.sh"
    exit 1
fi

ACCOUNT_ID=$(aws $AWS_PROFILE_ARG sts get-caller-identity --query Account --output text)
CURRENT_USER=$(aws $AWS_PROFILE_ARG sts get-caller-identity --query Arn --output text)
echo -e "${GREEN}  Conectado na conta: ${YELLOW}${ACCOUNT_ID}${NC}"
echo -e "${GREEN}  Usuario/Role: ${CURRENT_USER}${NC}"
echo ""

# Confirmacao
read -p "Confirma que esta e a conta AWS de HML? (s/n): " CONFIRM
if [[ "$CONFIRM" != "s" && "$CONFIRM" != "S" ]]; then
    echo "Operacao cancelada."
    exit 0
fi
echo ""

# ===========================================
# S3 Bucket para Terraform State
# ===========================================
echo -e "${BLUE}[2/5] Criando S3 bucket para Terraform state...${NC}"

if aws $AWS_PROFILE_ARG s3api head-bucket --bucket "${STATE_BUCKET}" 2>/dev/null; then
    echo -e "${GREEN}  Bucket ${STATE_BUCKET} ja existe${NC}"
else
    echo "  Criando bucket ${STATE_BUCKET}..."
    
    aws $AWS_PROFILE_ARG s3api create-bucket \
        --bucket "${STATE_BUCKET}" \
        --region "${AWS_REGION}" \
        --create-bucket-configuration LocationConstraint="${AWS_REGION}"
    
    # Versionamento
    aws $AWS_PROFILE_ARG s3api put-bucket-versioning \
        --bucket "${STATE_BUCKET}" \
        --versioning-configuration Status=Enabled
    
    # Criptografia
    aws $AWS_PROFILE_ARG s3api put-bucket-encryption \
        --bucket "${STATE_BUCKET}" \
        --server-side-encryption-configuration '{
            "Rules": [{
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }]
        }'
    
    # Bloquear acesso publico
    aws $AWS_PROFILE_ARG s3api put-public-access-block \
        --bucket "${STATE_BUCKET}" \
        --public-access-block-configuration \
            BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
    
    echo -e "${GREEN}  Bucket criado e configurado${NC}"
fi
echo ""

# ===========================================
# DynamoDB para State Locking
# ===========================================
echo -e "${BLUE}[3/5] Criando tabela DynamoDB para locks...${NC}"

if aws $AWS_PROFILE_ARG dynamodb describe-table --table-name "${LOCK_TABLE}" --region "${AWS_REGION}" &>/dev/null; then
    echo -e "${GREEN}  Tabela ${LOCK_TABLE} ja existe${NC}"
else
    echo "  Criando tabela ${LOCK_TABLE}..."
    
    aws $AWS_PROFILE_ARG dynamodb create-table \
        --table-name "${LOCK_TABLE}" \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region "${AWS_REGION}" \
        --tags Key=Environment,Value=hml Key=ManagedBy,Value=bootstrap-script
    
    echo "  Aguardando tabela ficar ativa..."
    aws $AWS_PROFILE_ARG dynamodb wait table-exists --table-name "${LOCK_TABLE}" --region "${AWS_REGION}"
    
    echo -e "${GREEN}  Tabela criada${NC}"
fi
echo ""

# ===========================================
# IAM Role para CI/CD (Bitbucket)
# ===========================================
echo -e "${BLUE}[4/5] Criando IAM Role para CI/CD...${NC}"

CICD_ROLE_NAME="TryaCiCdRole-HML"

if aws $AWS_PROFILE_ARG iam get-role --role-name "${CICD_ROLE_NAME}" &>/dev/null; then
    echo -e "${GREEN}  Role ${CICD_ROLE_NAME} ja existe${NC}"
else
    echo "  Criando role ${CICD_ROLE_NAME}..."
    
    # Trust policy para Bitbucket OIDC ou para chaves de acesso
    # Se BITBUCKET_WORKSPACE_UUID estiver definido, usa OIDC; senao, trust basico
    if [[ -n "${BITBUCKET_WORKSPACE_UUID}" ]]; then
        TRUST_POLICY=$(cat <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::${ACCOUNT_ID}:oidc-provider/api.bitbucket.org/2.0/workspaces/${BITBUCKET_WORKSPACE_UUID}/pipelines-config/identity/oidc"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "api.bitbucket.org/2.0/workspaces/${BITBUCKET_WORKSPACE_UUID}/pipelines-config/identity/oidc:aud": "ari:cloud:bitbucket::workspace/${BITBUCKET_WORKSPACE_UUID}"
                }
            }
        }
    ]
}
EOF
)
        echo "  Usando OIDC do Bitbucket"
    else
        # Trust policy para IAM user (fallback para access keys)
        TRUST_POLICY=$(cat <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::${ACCOUNT_ID}:root"
            },
            "Action": "sts:AssumeRole",
            "Condition": {}
        }
    ]
}
EOF
)
        echo -e "${YELLOW}  BITBUCKET_WORKSPACE_UUID nao definido - usando trust policy basica${NC}"
        echo -e "${YELLOW}  Para OIDC, re-execute com: BITBUCKET_WORKSPACE_UUID=xxx ./bootstrap-hml-account.sh${NC}"
    fi
    
    aws $AWS_PROFILE_ARG iam create-role \
        --role-name "${CICD_ROLE_NAME}" \
        --assume-role-policy-document "${TRUST_POLICY}" \
        --description "Role para CI/CD Bitbucket - Ambiente HML" \
        --tags Key=Environment,Value=hml Key=ManagedBy,Value=bootstrap-script
    
    # Policies necessarias para deploy
    DEPLOY_POLICY=$(cat <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "ECRAccess",
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:PutImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload",
                "ecr:DescribeRepositories",
                "ecr:CreateRepository",
                "ecr:ListImages"
            ],
            "Resource": "*"
        },
        {
            "Sid": "ECSAccess",
            "Effect": "Allow",
            "Action": [
                "ecs:DescribeServices",
                "ecs:UpdateService",
                "ecs:DescribeTaskDefinition",
                "ecs:RegisterTaskDefinition",
                "ecs:DeregisterTaskDefinition",
                "ecs:ListTaskDefinitions",
                "ecs:DescribeClusters",
                "ecs:ListClusters"
            ],
            "Resource": "*"
        },
        {
            "Sid": "IAMPassRole",
            "Effect": "Allow",
            "Action": "iam:PassRole",
            "Resource": "*",
            "Condition": {
                "StringLike": {
                    "iam:PassedToService": [
                        "ecs-tasks.amazonaws.com"
                    ]
                }
            }
        },
        {
            "Sid": "CloudFrontAccess",
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateInvalidation",
                "cloudfront:GetInvalidation",
                "cloudfront:ListInvalidations"
            ],
            "Resource": "*"
        },
        {
            "Sid": "S3Access",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::trya-*",
                "arn:aws:s3:::trya-*/*"
            ]
        },
        {
            "Sid": "SecretsManagerRead",
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue"
            ],
            "Resource": "arn:aws:secretsmanager:${AWS_REGION}:${ACCOUNT_ID}:secret:trya-*"
        },
        {
            "Sid": "SSMRead",
            "Effect": "Allow",
            "Action": [
                "ssm:GetParameter",
                "ssm:GetParameters"
            ],
            "Resource": "arn:aws:ssm:${AWS_REGION}:${ACCOUNT_ID}:parameter/trya/*"
        },
        {
            "Sid": "CloudWatchLogs",
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:DescribeLogGroups",
                "logs:DescribeLogStreams"
            ],
            "Resource": "*"
        }
    ]
}
EOF
)
    
    aws $AWS_PROFILE_ARG iam put-role-policy \
        --role-name "${CICD_ROLE_NAME}" \
        --policy-name "TryaCiCdDeployPolicy" \
        --policy-document "${DEPLOY_POLICY}"
    
    echo -e "${GREEN}  Role criada com policies de deploy${NC}"
fi
echo ""

# ===========================================
# Resumo
# ===========================================
echo -e "${BLUE}[5/5] Resumo da configuracao${NC}"
echo ""
echo "=========================================="
echo -e "${GREEN}Bootstrap concluido com sucesso!${NC}"
echo "=========================================="
echo ""
echo "Recursos criados na conta ${ACCOUNT_ID}:"
echo "  - S3 Bucket: ${STATE_BUCKET}"
echo "  - DynamoDB Table: ${LOCK_TABLE}"
echo "  - IAM Role: ${CICD_ROLE_NAME}"
echo ""
echo -e "${YELLOW}Proximos passos:${NC}"
echo ""
echo "1. Atualize o backend.conf do HML para usar o bucket desta conta:"
echo "   environments/hml/backend.conf:"
echo "   ---------------------------------"
echo "   bucket         = \"${STATE_BUCKET}\""
echo "   key            = \"hml/terraform.tfstate\""
echo "   region         = \"${AWS_REGION}\""
echo "   encrypt        = true"
echo "   dynamodb_table = \"${LOCK_TABLE}\""
echo ""
echo "2. Configure as variaveis no Bitbucket para o deployment Staging:"
echo "   - AWS_ACCESS_KEY_ID (ou configure OIDC)"
echo "   - AWS_SECRET_ACCESS_KEY"
echo "   - AWS_REGION: ${AWS_REGION}"
echo "   - AWS_ECR_REGISTRY: ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
echo ""
echo "3. Inicialize o Terraform para HML:"
echo "   cd handslab-trya-infra"
echo "   terraform init -backend-config=environments/hml/backend.conf"
echo "   terraform plan -var-file=environments/hml/terraform.tfvars"
echo ""
