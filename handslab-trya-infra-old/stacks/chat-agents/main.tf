# ==============================================================================
# Chat Agents Stack
# ==============================================================================
# Provisions: Lambda (in VPC), DynamoDB, S3, VPC Endpoints, ElastiCache,
# Security Groups, IAM roles.
#
# This stack migrates the SAM template (handslab-trya-chat-agents/template.yaml)
# to Terraform.
#
# Depends on: network stack (for VPC, subnets)
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    # terraform init -backend-config=../../environments/dev/chat-agents.backend.conf
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Stack       = "chat-agents"
    }
  }
}

# ==============================================================================
# Remote State - Network Stack
# ==============================================================================
data "terraform_remote_state" "network" {
  backend = "s3"

  config = {
    bucket  = var.state_bucket
    key     = "${var.environment}/network/terraform.tfstate"
    region  = "sa-east-1"  # Bucket is always in sa-east-1
    profile = var.aws_profile
  }
}

# ==============================================================================
# Locals
# ==============================================================================
locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Stack       = "chat-agents"
    },
    var.additional_tags
  )

  # Network outputs
  vpc_id             = data.terraform_remote_state.network.outputs.vpc_id
  public_subnet_ids  = data.terraform_remote_state.network.outputs.public_subnet_ids
  private_subnet_ids = data.terraform_remote_state.network.outputs.private_subnet_ids
}

# ==============================================================================
# DynamoDB Table for Sessions
# ==============================================================================
module "dynamodb" {
  source = "../../modules/dynamodb"

  project_name = var.project_name
  environment  = var.environment

  table_name   = "triagem-sessions-${var.environment}"
  hash_key     = "session_id"
  billing_mode = "PAY_PER_REQUEST"

  ttl_enabled        = true
  ttl_attribute_name = "ttl"

  tags = local.common_tags
}

# ==============================================================================
# S3 Bucket for Transcription and Images
# ==============================================================================
module "s3_bucket" {
  source = "../../modules/s3_static_site"

  project_name = var.project_name
  environment  = var.environment
  bucket_name  = "triagem-ia-${var.environment}"

  tags = local.common_tags
}

# ==============================================================================
# Security Group for Lambda and ElastiCache
# ==============================================================================
resource "aws_security_group" "lambda" {
  name_prefix = "${local.name_prefix}-lambda-"
  description = "Security group for Lambda, ElastiCache and VPC Endpoints"
  vpc_id      = local.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-lambda-sg"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}

# Self-referencing ingress rule to allow internal communication
resource "aws_security_group_rule" "lambda_self_ingress" {
  type                     = "ingress"
  from_port                = 0
  to_port                  = 0
  protocol                 = "-1"
  source_security_group_id = aws_security_group.lambda.id
  security_group_id        = aws_security_group.lambda.id
  description              = "Allow all traffic from same security group"
}

# ==============================================================================
# ElastiCache Serverless (Valkey)
# ==============================================================================
module "elasticache" {
  source = "../../modules/elasticache"

  project_name = var.project_name
  environment  = var.environment

  cache_name = "triagem-cache-${var.environment}"
  engine     = "valkey"

  vpc_id             = local.vpc_id
  subnet_ids         = local.private_subnet_ids
  security_group_ids = [aws_security_group.lambda.id]

  tags = local.common_tags
}

# ==============================================================================
# VPC Endpoints
# ==============================================================================
module "vpc_endpoints" {
  source = "../../modules/vpc-endpoints"

  project_name = var.project_name
  environment  = var.environment

  vpc_id             = local.vpc_id
  subnet_ids         = local.private_subnet_ids
  security_group_ids = [aws_security_group.lambda.id]

  # Gateway endpoints (free)
  create_s3_endpoint       = true
  create_dynamodb_endpoint = true

  # Interface endpoints
  create_bedrock_runtime_endpoint       = true
  create_bedrock_agent_runtime_endpoint = true
  create_transcribe_endpoint            = true

  tags = local.common_tags
}

# ==============================================================================
# Lambda Function
# ==============================================================================
module "lambda" {
  source = "../../modules/lambda"

  project_name = var.project_name
  environment  = var.environment

  function_name = "triagem-saude-agente-${var.environment}"
  description   = "Lambda para triagem de saude usando agentes LangChain"
  runtime       = "python3.11"
  handler       = "placeholder_handler.lambda_handler"
  timeout       = 300
  memory_size   = 1024
  
  # Placeholder package - deploy real code via CI/CD
  filename      = "${path.module}/../../artifacts/placeholder_lambda.zip"

  # VPC configuration
  vpc_id             = local.vpc_id
  subnet_ids         = local.private_subnet_ids
  security_group_ids = [aws_security_group.lambda.id]

  # Environment variables
  environment_variables = {
    BEDROCK_MODEL_ID       = var.bedrock_model_id
    KNOWLEDGE_BASE_ID      = var.knowledge_base_id
    SESSIONS_TABLE_NAME    = module.dynamodb.table_name
    BUCKET_NAME            = module.s3_bucket.bucket_id
    STORAGE_BACKEND        = "hybrid"
    CACHE_ENDPOINT         = module.elasticache.endpoint
    CACHE_PORT             = module.elasticache.port
    CACHE_TTL              = "3600"
    TRYA_API_PLATFORM_URL  = var.trya_api_platform_url
    TRYA_API_PLATFORM_KEY  = var.trya_api_platform_key
    TENANT_API_URL         = var.tenant_api_url
    TENANT_API_KEY         = var.tenant_api_key
  }

  # IAM permissions
  additional_policies = [
    {
      name = "bedrock-access"
      policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
          {
            Effect = "Allow"
            Action = [
              "bedrock:InvokeModel",
              "bedrock:InvokeModelWithResponseStream"
            ]
            Resource = "arn:aws:bedrock:${var.aws_region}::foundation-model/*"
          },
          {
            Effect = "Allow"
            Action = [
              "bedrock:Retrieve",
              "bedrock-agent-runtime:Retrieve"
            ]
            Resource = "*"
          }
        ]
      })
    },
    {
      name = "dynamodb-access"
      policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
          {
            Effect = "Allow"
            Action = [
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:DeleteItem",
              "dynamodb:Query"
            ]
            Resource = module.dynamodb.table_arn
          }
        ]
      })
    },
    {
      name = "transcribe-access"
      policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
          {
            Effect = "Allow"
            Action = [
              "transcribe:StartTranscriptionJob",
              "transcribe:GetTranscriptionJob",
              "transcribe:DeleteTranscriptionJob"
            ]
            Resource = "*"
          }
        ]
      })
    },
    {
      name = "s3-access"
      policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
          {
            Effect   = "Allow"
            Action   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
            Resource = "${module.s3_bucket.bucket_arn}/*"
          },
          {
            Effect   = "Allow"
            Action   = ["s3:ListBucket"]
            Resource = module.s3_bucket.bucket_arn
          }
        ]
      })
    },
    {
      name = "elasticache-access"
      policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
          {
            Effect   = "Allow"
            Action   = ["elasticache:Connect"]
            Resource = "*"
          }
        ]
      })
    }
  ]

  tags = local.common_tags

  depends_on = [
    module.dynamodb,
    module.s3_bucket,
    module.elasticache,
    module.vpc_endpoints
  ]
}
