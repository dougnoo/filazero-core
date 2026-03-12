# =============================================================================
# Lambda AI - Agente de Triagem de Saúde
# =============================================================================

terraform {
  source = "../../../../../modules/compute/lambda"

  before_hook "create_placeholder" {
    commands = ["apply", "plan"]
    execute  = ["bash", "-c", "echo 'def lambda_handler(event, context): return {\"statusCode\": 200, \"body\": \"Deploy via pipeline\"}' > /tmp/index.py && cd /tmp && zip -q placeholder.zip index.py && mv placeholder.zip ${get_terragrunt_dir()}/placeholder.zip"]
  }
}

include "root" {
  path = find_in_parent_folders()
}

# =============================================================================
# Dependencies
# =============================================================================

dependency "vpc" {
  config_path = "../../shared-services/vpc"
  
  mock_outputs = {
    vpc_id                          = "vpc-mock123456"
    vpc_cidr                        = "10.0.0.0/16"
    private_subnet_ids              = ["subnet-mock789", "subnet-mock012"]
    vpc_endpoints_security_group_id = "sg-mockendpoints"
  }
  
  mock_outputs_allowed_terraform_commands = ["plan", "validate"]
}

dependency "lambda_sg" {
  config_path = "../lambda-sg"
  
  mock_outputs = {
    security_group_id = "sg-mocklambda"
  }
  
  mock_outputs_allowed_terraform_commands = ["plan", "validate"]
}

# =============================================================================
# Locals
# =============================================================================

locals {
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  account_name = local.account_vars.locals.account_name
  name_parts   = split("-", local.account_name)
  environment  = element(local.name_parts, length(local.name_parts) - 1)
}

# =============================================================================
# Inputs
# =============================================================================

inputs = {
  function_name = "${local.account_name}-triagem-ia"
  description   = "Lambda para agente de triagem de saúde com IA"

  runtime                = "python3.11"
  handler                = "src.lambda_handler.lambda_handler"
  timeout                = 300
  memory_size            = 1024
  ephemeral_storage_size = 512
  filename               = "placeholder.zip"
  vpc_cidr           = dependency.vpc.outputs.vpc_cidr
  vpc_id             = dependency.vpc.outputs.vpc_id

  vpc_config = {
    vpc_cidr           = dependency.vpc.outputs.vpc_cidr
    vpc_id             = dependency.vpc.outputs.vpc_id
    subnet_ids         = dependency.vpc.outputs.private_subnet_ids
    security_group_ids = [dependency.lambda_sg.outputs.security_group_id]
  }

  environment_variables = {
    BEDROCK_MODEL_ID      = "us.anthropic.claude-3-7-sonnet-20250219-v1:0"
    KNOWLEDGE_BASE_ID     = "A2DCFSGQSI"
    STORAGE_BACKEND       = "hybrid"
    CACHE_ENDPOINT        = "admin-trya-dev-cache-y2le9h.serverless.use1.cache.amazonaws.com"
    CACHE_PORT            = "6379"
    SESSIONS_TABLE_NAME   = "${local.account_name}-sessions"
    BUCKET_NAME           = "${local.account_name}-triagem-ia"
    CACHE_TTL             = "3600"
    TRYA_API_PLATFORM_URL = "https://platform-admin.dev.trya.skopiadigital.com.br"
    TRYA_API_PLATFORM_KEY = "Tr7revjJDZJaae3Xz5G7v8K3bH9mU6nYX"
    TENANT_API_URL        = "https://admin.dev.trya.skopiadigital.com.br"
    TENANT_API_KEY        = "yEem5dI75RXZD5xtr120ZIytglk68tGwRbKL"
  }

  enable_bedrock     = true
  enable_dynamodb    = true
  enable_s3          = true
  enable_transcribe  = true
  enable_elasticache = true

  dynamodb_table_arns = [
    "arn:aws:dynamodb:*:*:table/${local.account_name}-sessions",
    "arn:aws:dynamodb:*:*:table/triagem-audit-logs"
  ]
  s3_bucket_arns = ["arn:aws:s3:::${local.account_name}-triagem-ia"]

  log_retention_days = local.environment == "prod" ? 30 : 7
  enable_xray        = local.environment == "prod"

  tags = {
    Name        = "${local.account_name}-triagem-ia"
    Service     = "triagem-saude"
    Purpose     = "ai-agent"
    Environment = local.environment
    ManagedBy   = "terragrunt"
  }
}
