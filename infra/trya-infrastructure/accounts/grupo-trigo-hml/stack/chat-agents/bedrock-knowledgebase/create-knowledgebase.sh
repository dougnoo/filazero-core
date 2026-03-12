#!/bin/bash

# =============================================================================
# Script para criar Bedrock Knowledge Base com OpenSearch Serverless
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configurações
REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
COLLECTION_NAME="grupo-trigo-hml-store"
KB_NAME="grupo-trigo-hml-kb"
KB_DESCRIPTION="Knowledge base for Trya AI triagem"
S3_BUCKET="grupo-trigo-hml-triagem-ia"
EMBEDDING_MODEL="arn:aws:bedrock:${REGION}::foundation-model/amazon.titan-embed-text-v1"

print_status "🚀 Iniciando criação do Bedrock Knowledge Base..."
echo ""
echo "Configurações:"
echo "  - Region: $REGION"
echo "  - Account ID: $ACCOUNT_ID"
echo "  - Collection: $COLLECTION_NAME"
echo "  - Knowledge Base: $KB_NAME"
echo "  - S3 Bucket: $S3_BUCKET"
echo ""

# Verificar dependências Python
print_status "Verificando dependências Python..."
if ! python3 -c "import requests, requests_aws4auth" 2>/dev/null; then
    print_status "Instalando dependências: requests, requests-aws4auth..."
    pip3 install requests requests-aws4auth --quiet
fi
print_success "Dependências OK"

# Verificar bucket S3
print_status "Verificando bucket S3..."
if aws s3 ls "s3://$S3_BUCKET" --region $REGION >/dev/null 2>&1; then
    print_success "Bucket S3 encontrado: $S3_BUCKET"
else
    print_error "Bucket S3 não encontrado: $S3_BUCKET"
    exit 1
fi

# Step 1: Encryption Policy
print_status "Step 1: Criando Encryption Policy..."

ENCRYPTION_POLICY="{\"Rules\":[{\"ResourceType\":\"collection\",\"Resource\":[\"collection/${COLLECTION_NAME}\"]}],\"AWSOwnedKey\":true}"

EXISTING_ENCRYPTION=$(aws opensearchserverless get-security-policy \
    --name "${COLLECTION_NAME}-encryption" \
    --type encryption \
    --region $REGION 2>/dev/null || echo "")

if [ -z "$EXISTING_ENCRYPTION" ]; then
    aws opensearchserverless create-security-policy \
        --name "${COLLECTION_NAME}" \
        --type encryption \
        --policy "$ENCRYPTION_POLICY" \
        --region $REGION >/dev/null
    print_success "Encryption policy criada"
else
    print_warning "Encryption policy já existe"
fi

# Step 2: Network Policy
print_status "Step 2: Criando Network Policy..."

NETWORK_POLICY="[{\"Rules\":[{\"ResourceType\":\"dashboard\",\"Resource\":[\"collection/${COLLECTION_NAME}\"]},{\"ResourceType\":\"collection\",\"Resource\":[\"collection/${COLLECTION_NAME}\"]}],\"AllowFromPublic\":true}]"

EXISTING_NETWORK=$(aws opensearchserverless get-security-policy \
    --name "${COLLECTION_NAME}-network" \
    --type network \
    --region $REGION 2>/dev/null || echo "")

if [ -z "$EXISTING_NETWORK" ]; then
    aws opensearchserverless create-security-policy \
        --name "${COLLECTION_NAME}-network" \
        --type network \
        --policy "$NETWORK_POLICY" \
        --region $REGION >/dev/null
    print_success "Network policy criada"
else
    print_warning "Network policy já existe"
fi

# Step 3: IAM Role (criado antes da Data Access Policy para incluir o ARN nela)
print_status "Step 3: Criando IAM Role..."

KB_ROLE_NAME="${KB_NAME}-role"

TRUST_POLICY="{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"bedrock.amazonaws.com\"},\"Action\":\"sts:AssumeRole\",\"Condition\":{\"StringEquals\":{\"aws:SourceAccount\":\"${ACCOUNT_ID}\"},\"ArnLike\":{\"aws:SourceArn\":\"arn:aws:bedrock:${REGION}:${ACCOUNT_ID}:knowledge-base/*\"}}}]}"

if aws iam get-role --role-name "$KB_ROLE_NAME" >/dev/null 2>&1; then
    print_warning "IAM Role já existe: $KB_ROLE_NAME"
    KB_ROLE_ARN=$(aws iam get-role --role-name "$KB_ROLE_NAME" --query 'Role.Arn' --output text)
else
    KB_ROLE_ARN=$(aws iam create-role \
        --role-name "$KB_ROLE_NAME" \
        --assume-role-policy-document "$TRUST_POLICY" \
        --description "Role for Bedrock Knowledge Base" \
        --query 'Role.Arn' \
        --output text)
    print_success "IAM Role criada: $KB_ROLE_ARN"
fi

# Step 4: Data Access Policy (inclui tanto o usuário atual quanto a role do KB)
print_status "Step 4: Criando Data Access Policy..."

CURRENT_USER_ARN=$(aws sts get-caller-identity --query 'Arn' --output text)

DATA_ACCESS_POLICY="[{\"Rules\":[{\"ResourceType\":\"collection\",\"Resource\":[\"collection/${COLLECTION_NAME}\"],\"Permission\":[\"aoss:CreateCollectionItems\",\"aoss:UpdateCollectionItems\",\"aoss:DescribeCollectionItems\"]},{\"ResourceType\":\"index\",\"Resource\":[\"index/${COLLECTION_NAME}/*\"],\"Permission\":[\"aoss:CreateIndex\",\"aoss:UpdateIndex\",\"aoss:DescribeIndex\",\"aoss:ReadDocument\",\"aoss:WriteDocument\"]}],\"Principal\":[\"${CURRENT_USER_ARN}\",\"${KB_ROLE_ARN}\"]}]"

EXISTING_ACCESS=$(aws opensearchserverless get-access-policy \
    --name "${COLLECTION_NAME}-access" \
    --type data \
    --region $REGION 2>/dev/null || echo "")

if [ -z "$EXISTING_ACCESS" ]; then
    aws opensearchserverless create-access-policy \
        --name "${COLLECTION_NAME}-access" \
        --type data \
        --policy "$DATA_ACCESS_POLICY" \
        --region $REGION >/dev/null
    print_success "Data access policy criada"
else
    # Atualiza a policy existente para garantir que o KB_ROLE_ARN está incluso
    print_warning "Data access policy já existe — atualizando para incluir KB Role ARN..."
    POLICY_VERSION=$(aws opensearchserverless get-access-policy \
        --name "${COLLECTION_NAME}-access" \
        --type data \
        --region $REGION \
        --query 'accessPolicyDetail.policyVersion' \
        --output text)
    aws opensearchserverless update-access-policy \
        --name "${COLLECTION_NAME}-access" \
        --type data \
        --policy "$DATA_ACCESS_POLICY" \
        --policy-version "$POLICY_VERSION" \
        --region $REGION >/dev/null
    print_success "Data access policy atualizada"
fi

print_status "Aguardando propagação das políticas (5 segundos)..."
sleep 5

# Step 5: OpenSearch Collection
print_status "Step 5: Criando OpenSearch Serverless Collection..."

COLLECTION_ID=$(aws opensearchserverless list-collections \
    --region $REGION \
    --query "collectionSummaries[?name=='${COLLECTION_NAME}'].id" \
    --output text)

if [ -z "$COLLECTION_ID" ]; then
    COLLECTION_RESPONSE=$(aws opensearchserverless create-collection \
        --name "$COLLECTION_NAME" \
        --type VECTORSEARCH \
        --description "Vector store for Bedrock Knowledge Base" \
        --region $REGION)

    COLLECTION_ID=$(echo $COLLECTION_RESPONSE | jq -r '.createCollectionDetail.id')
    print_success "Collection criada: $COLLECTION_ID"
else
    print_warning "Collection já existe: $COLLECTION_ID"
fi

# Aguardar collection ficar ativa
print_status "Aguardando collection ficar ativa..."
while true; do
    STATUS=$(aws opensearchserverless batch-get-collection \
        --ids "$COLLECTION_ID" \
        --region $REGION \
        --query 'collectionDetails[0].status' \
        --output text)

    if [ "$STATUS" == "ACTIVE" ]; then
        print_success "Collection está ativa"
        break
    elif [ "$STATUS" == "FAILED" ]; then
        print_error "Falha ao criar collection"
        exit 1
    fi
    echo -n "."
    sleep 10
done

COLLECTION_ENDPOINT=$(aws opensearchserverless batch-get-collection \
    --ids "$COLLECTION_ID" \
    --region $REGION \
    --query 'collectionDetails[0].collectionEndpoint' \
    --output text)

print_success "Collection endpoint: $COLLECTION_ENDPOINT"

# Step 6: Criar índice vetorial no OpenSearch
print_status "Step 6: Criando índice vetorial no OpenSearch (bedrock-kb-index)..."

python3 << PYEOF
import sys
import boto3
import requests
from requests_aws4auth import AWS4Auth

region = "${REGION}"
host = "${COLLECTION_ENDPOINT}"
index_name = "bedrock-kb-index"

session = boto3.Session()
credentials = session.get_credentials().get_frozen_credentials()

auth = AWS4Auth(
    credentials.access_key,
    credentials.secret_key,
    region,
    "aoss",
    session_token=credentials.token,
)

# Verificar se o índice já existe
check_url = f"{host}/{index_name}"
response = requests.head(check_url, auth=auth)
if response.status_code == 200:
    print("Índice bedrock-kb-index já existe, pulando criação.")
    sys.exit(0)

index_body = {
    "settings": {
        "index.knn": True
    },
    "mappings": {
        "properties": {
            "bedrock-knowledge-base-default-vector": {
                "type": "knn_vector",
                "dimension": 1536,
                "method": {
                    "name": "hnsw",
                    "engine": "faiss",
                    "space_type": "l2",
                    "parameters": {
                        "ef_construction": 512,
                        "m": 16
                    }
                }
            },
            "AMAZON_BEDROCK_TEXT_CHUNK": {
                "type": "text"
            },
            "AMAZON_BEDROCK_METADATA": {
                "type": "text",
                "index": False
            }
        }
    }
}

url = f"{host}/{index_name}"
response = requests.put(
    url,
    auth=auth,
    json=index_body,
    headers={"Content-Type": "application/json"}
)

print(f"Status: {response.status_code} - {response.text}")
if response.status_code not in (200, 201):
    print(f"ERRO ao criar índice: {response.text}", file=sys.stderr)
    sys.exit(1)

print("Índice bedrock-kb-index criado com sucesso.")
PYEOF

if [ $? -ne 0 ]; then
    print_error "Falha ao criar índice OpenSearch"
    exit 1
fi

print_status "Aguardando propagação do índice (15 segundos)..."
sleep 15
print_success "Índice vetorial criado"

# Step 7: IAM Policy
print_status "Step 7: Adicionando políticas ao IAM Role..."

KB_POLICY="{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"bedrock:InvokeModel\"],\"Resource\":[\"${EMBEDDING_MODEL}\"]},{\"Effect\":\"Allow\",\"Action\":[\"s3:GetObject\",\"s3:ListBucket\"],\"Resource\":[\"arn:aws:s3:::${S3_BUCKET}\",\"arn:aws:s3:::${S3_BUCKET}/*\"]},{\"Effect\":\"Allow\",\"Action\":[\"aoss:APIAccessAll\"],\"Resource\":[\"arn:aws:aoss:${REGION}:${ACCOUNT_ID}:collection/${COLLECTION_ID}\"]}]}"

aws iam put-role-policy \
    --role-name "$KB_ROLE_NAME" \
    --policy-name "${KB_NAME}-policy" \
    --policy-document "$KB_POLICY" >/dev/null

print_success "Políticas adicionadas"
print_status "Aguardando propagação do IAM (15 segundos)..."
sleep 15

# Step 8: Knowledge Base
print_status "Step 8: Criando Bedrock Knowledge Base..."

EXISTING_KB=$(aws bedrock-agent list-knowledge-bases \
    --region $REGION \
    --query "knowledgeBaseSummaries[?name=='${KB_NAME}'].knowledgeBaseId" \
    --output text)

if [ -n "$EXISTING_KB" ]; then
    print_warning "Knowledge Base já existe: $EXISTING_KB"
    KB_ID="$EXISTING_KB"
else
    KB_CONFIG="{\"name\":\"${KB_NAME}\",\"description\":\"${KB_DESCRIPTION}\",\"roleArn\":\"${KB_ROLE_ARN}\",\"knowledgeBaseConfiguration\":{\"type\":\"VECTOR\",\"vectorKnowledgeBaseConfiguration\":{\"embeddingModelArn\":\"${EMBEDDING_MODEL}\"}},\"storageConfiguration\":{\"type\":\"OPENSEARCH_SERVERLESS\",\"opensearchServerlessConfiguration\":{\"collectionArn\":\"arn:aws:aoss:${REGION}:${ACCOUNT_ID}:collection/${COLLECTION_ID}\",\"vectorIndexName\":\"bedrock-kb-index\",\"fieldMapping\":{\"vectorField\":\"bedrock-knowledge-base-default-vector\",\"textField\":\"AMAZON_BEDROCK_TEXT_CHUNK\",\"metadataField\":\"AMAZON_BEDROCK_METADATA\"}}}}"

    KB_RESPONSE=$(aws bedrock-agent create-knowledge-base \
        --region $REGION \
        --cli-input-json "$KB_CONFIG")

    KB_ID=$(echo $KB_RESPONSE | jq -r '.knowledgeBase.knowledgeBaseId')
    print_success "Knowledge Base criado: $KB_ID"
fi

KB_ARN="arn:aws:bedrock:${REGION}:${ACCOUNT_ID}:knowledge-base/${KB_ID}"

# Step 9: Data Source
print_status "Step 9: Criando Data Source..."

DS_CONFIG="{\"knowledgeBaseId\":\"${KB_ID}\",\"name\":\"${S3_BUCKET}-source\",\"description\":\"S3 data source\",\"dataSourceConfiguration\":{\"type\":\"S3\",\"s3Configuration\":{\"bucketArn\":\"arn:aws:s3:::${S3_BUCKET}\",\"inclusionPrefixes\":[\"documents/\"]}},\"vectorIngestionConfiguration\":{\"chunkingConfiguration\":{\"chunkingStrategy\":\"FIXED_SIZE\",\"fixedSizeChunkingConfiguration\":{\"maxTokens\":300,\"overlapPercentage\":20}}}}"

EXISTING_DS=$(aws bedrock-agent list-data-sources \
    --knowledge-base-id "$KB_ID" \
    --region $REGION \
    --query "dataSourceSummaries[0].dataSourceId" \
    --output text 2>/dev/null || echo "")

if [ -n "$EXISTING_DS" ] && [ "$EXISTING_DS" != "None" ]; then
    print_warning "Data Source já existe: $EXISTING_DS"
    DS_ID="$EXISTING_DS"
else
    DS_RESPONSE=$(aws bedrock-agent create-data-source \
        --region $REGION \
        --cli-input-json "$DS_CONFIG")

    DS_ID=$(echo $DS_RESPONSE | jq -r '.dataSource.dataSourceId')
    print_success "Data Source criado: $DS_ID"
fi

# Step 10: Salvar IDs
print_status "Step 10: Salvando IDs..."

cat > knowledge-base-ids.txt <<EOF
# Bedrock Knowledge Base IDs
# Criado em: $(date)

KNOWLEDGE_BASE_ID=${KB_ID}
KNOWLEDGE_BASE_ARN=${KB_ARN}
DATA_SOURCE_ID=${DS_ID}
COLLECTION_ID=${COLLECTION_ID}
COLLECTION_ENDPOINT=${COLLECTION_ENDPOINT}
IAM_ROLE_ARN=${KB_ROLE_ARN}

# Use estes valores na configuração da Lambda
EOF

print_success "IDs salvos em knowledge-base-ids.txt"

# Summary
echo ""
print_success "🎉 Bedrock Knowledge Base criado com sucesso!"
echo ""
echo "📋 Recursos Criados:"
echo "  ✅ OpenSearch Collection: $COLLECTION_ID"
echo "  ✅ Collection Endpoint: $COLLECTION_ENDPOINT"
echo "  ✅ OpenSearch Index: bedrock-kb-index"
echo "  ✅ IAM Role: $KB_ROLE_ARN"
echo "  ✅ Knowledge Base: $KB_ID"
echo "  ✅ Data Source: $DS_ID"
echo ""
echo "📝 Próximos Passos:"
echo "  1. Upload documentos: s3://${S3_BUCKET}/documents/"
echo "  2. Sincronizar KB:"
echo "     aws bedrock-agent start-ingestion-job \\"
echo "       --knowledge-base-id ${KB_ID} \\"
echo "       --data-source-id ${DS_ID} \\"
echo "       --region ${REGION}"
echo "  3. Atualizar Lambda com KNOWLEDGE_BASE_ID=${KB_ID}"
echo "  4. Deploy Lambda: cd ../lambda-ai && terragrunt apply"
echo ""