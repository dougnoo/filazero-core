# ==============================================================================
# VPC Endpoints Module
# ==============================================================================
# Creates VPC endpoints for AWS services to reduce NAT Gateway costs
# and improve security/performance

data "aws_region" "current" {}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  region      = data.aws_region.current.name
}

# ==============================================================================
# Gateway Endpoints (Free)
# ==============================================================================

# S3 Gateway Endpoint
resource "aws_vpc_endpoint" "s3" {
  count = var.create_s3_endpoint ? 1 : 0

  vpc_id            = var.vpc_id
  service_name      = "com.amazonaws.${local.region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = var.route_table_ids

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-s3-endpoint"
    }
  )
}

# DynamoDB Gateway Endpoint
resource "aws_vpc_endpoint" "dynamodb" {
  count = var.create_dynamodb_endpoint ? 1 : 0

  vpc_id            = var.vpc_id
  service_name      = "com.amazonaws.${local.region}.dynamodb"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = var.route_table_ids

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-dynamodb-endpoint"
    }
  )
}

# ==============================================================================
# Interface Endpoints
# ==============================================================================

# Bedrock Runtime Endpoint
resource "aws_vpc_endpoint" "bedrock_runtime" {
  count = var.create_bedrock_runtime_endpoint ? 1 : 0

  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.${local.region}.bedrock-runtime"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  security_group_ids  = var.security_group_ids
  subnet_ids          = var.subnet_ids

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-bedrock-runtime-endpoint"
    }
  )
}

# Bedrock Agent Runtime Endpoint (Knowledge Base)
resource "aws_vpc_endpoint" "bedrock_agent_runtime" {
  count = var.create_bedrock_agent_runtime_endpoint ? 1 : 0

  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.${local.region}.bedrock-agent-runtime"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  security_group_ids  = var.security_group_ids
  subnet_ids          = var.subnet_ids

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-bedrock-agent-runtime-endpoint"
    }
  )
}

# Transcribe Endpoint
resource "aws_vpc_endpoint" "transcribe" {
  count = var.create_transcribe_endpoint ? 1 : 0

  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.${local.region}.transcribe"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  security_group_ids  = var.security_group_ids
  subnet_ids          = var.subnet_ids

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-transcribe-endpoint"
    }
  )
}

# Secrets Manager Endpoint
resource "aws_vpc_endpoint" "secrets_manager" {
  count = var.create_secrets_manager_endpoint ? 1 : 0

  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.${local.region}.secretsmanager"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  security_group_ids  = var.security_group_ids
  subnet_ids          = var.subnet_ids

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-secretsmanager-endpoint"
    }
  )
}

# ECR API Endpoint
resource "aws_vpc_endpoint" "ecr_api" {
  count = var.create_ecr_endpoints ? 1 : 0

  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.${local.region}.ecr.api"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  security_group_ids  = var.security_group_ids
  subnet_ids          = var.subnet_ids

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-ecr-api-endpoint"
    }
  )
}

# ECR DKR Endpoint
resource "aws_vpc_endpoint" "ecr_dkr" {
  count = var.create_ecr_endpoints ? 1 : 0

  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.${local.region}.ecr.dkr"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  security_group_ids  = var.security_group_ids
  subnet_ids          = var.subnet_ids

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-ecr-dkr-endpoint"
    }
  )
}

# CloudWatch Logs Endpoint
resource "aws_vpc_endpoint" "logs" {
  count = var.create_logs_endpoint ? 1 : 0

  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.${local.region}.logs"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  security_group_ids  = var.security_group_ids
  subnet_ids          = var.subnet_ids

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-logs-endpoint"
    }
  )
}

# STS Endpoint (for IAM role assumption)
resource "aws_vpc_endpoint" "sts" {
  count = var.create_sts_endpoint ? 1 : 0

  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.${local.region}.sts"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  security_group_ids  = var.security_group_ids
  subnet_ids          = var.subnet_ids

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-sts-endpoint"
    }
  )
}
