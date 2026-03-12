#!/bin/bash

# Trya Infrastructure - Setup Script
# This script helps you set up the Terraform backend and initial configuration

set -e

echo "🚀 Trya Infrastructure Setup"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="sa-east-1"
STATE_BUCKET="trya-terraform-state"
LOCK_TABLE="trya-terraform-locks"

echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS CLI found${NC}"

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform is not installed. Please install it first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Terraform found${NC}"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Run 'aws configure' first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS credentials configured${NC}"

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "  AWS Account: ${YELLOW}${ACCOUNT_ID}${NC}"

echo ""
echo -e "${YELLOW}Step 2: Creating S3 bucket for Terraform state...${NC}"

# Check if bucket exists
if aws s3 ls "s3://${STATE_BUCKET}" 2>&1 | grep -q 'NoSuchBucket'; then
    echo "  Creating bucket ${STATE_BUCKET}..."
    
    aws s3api create-bucket \
        --bucket ${STATE_BUCKET} \
        --region ${AWS_REGION} \
        --create-bucket-configuration LocationConstraint=${AWS_REGION}
    
    # Enable versioning
    aws s3api put-bucket-versioning \
        --bucket ${STATE_BUCKET} \
        --versioning-configuration Status=Enabled
    
    # Enable encryption
    aws s3api put-bucket-encryption \
        --bucket ${STATE_BUCKET} \
        --server-side-encryption-configuration '{
            "Rules": [{
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }]
        }'
    
    # Block public access
    aws s3api put-public-access-block \
        --bucket ${STATE_BUCKET} \
        --public-access-block-configuration \
            BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
    
    echo -e "${GREEN}✓ S3 bucket created and configured${NC}"
else
    echo -e "${GREEN}✓ S3 bucket already exists${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Creating DynamoDB table for state locking...${NC}"

# Check if table exists
if ! aws dynamodb describe-table --table-name ${LOCK_TABLE} --region ${AWS_REGION} &> /dev/null; then
    echo "  Creating table ${LOCK_TABLE}..."
    
    aws dynamodb create-table \
        --table-name ${LOCK_TABLE} \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region ${AWS_REGION}
    
    echo "  Waiting for table to be active..."
    aws dynamodb wait table-exists --table-name ${LOCK_TABLE} --region ${AWS_REGION}
    
    echo -e "${GREEN}✓ DynamoDB table created${NC}"
else
    echo -e "${GREEN}✓ DynamoDB table already exists${NC}"
fi

echo ""
echo -e "${YELLOW}Step 4: Configuration summary${NC}"
echo "  Bucket: ${STATE_BUCKET}"
echo "  Table: ${LOCK_TABLE}"
echo "  Region: ${AWS_REGION}"
echo ""

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review and update environment configurations:"
echo "     - environments/dev/terraform.tfvars"
echo "     - environments/hml/terraform.tfvars"
echo ""
echo "  2. Initialize Terraform for an environment:"
echo "     ${YELLOW}terraform init -backend-config=environments/dev/backend.conf${NC}"
echo ""
echo "  3. Plan your infrastructure:"
echo "     ${YELLOW}terraform plan -var-file=environments/dev/terraform.tfvars${NC}"
echo ""
echo "  4. Apply your infrastructure:"
echo "     ${YELLOW}terraform apply -var-file=environments/dev/terraform.tfvars${NC}"
echo ""
