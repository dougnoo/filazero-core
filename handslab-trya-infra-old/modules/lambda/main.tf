# ==============================================================================
# Lambda Module
# ==============================================================================
# Creates Lambda function with VPC support, IAM roles, and policies

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  region      = data.aws_region.current.name
  account_id  = data.aws_caller_identity.current.account_id
}

# ==============================================================================
# IAM Role for Lambda
# ==============================================================================
resource "aws_iam_role" "lambda" {
  name = "${var.function_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

# Basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# VPC access policy (if Lambda is in VPC)
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  count = var.vpc_id != null ? 1 : 0

  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Additional policies
resource "aws_iam_role_policy" "additional" {
  for_each = { for idx, policy in var.additional_policies : policy.name => policy }

  name   = each.key
  role   = aws_iam_role.lambda.id
  policy = each.value.policy
}

# ==============================================================================
# CloudWatch Log Group
# ==============================================================================
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

# ==============================================================================
# Lambda Function
# ==============================================================================
resource "aws_lambda_function" "this" {
  function_name = var.function_name
  description   = var.description
  role          = aws_iam_role.lambda.arn

  # Package configuration
  package_type = var.package_type
  
  # For ZIP packages - from local file
  filename         = var.package_type == "Zip" && var.filename != null ? var.filename : null
  source_code_hash = var.package_type == "Zip" && var.filename != null ? filebase64sha256(var.filename) : var.source_code_hash
  
  # For ZIP packages - from S3
  s3_bucket = var.package_type == "Zip" && var.s3_bucket != null ? var.s3_bucket : null
  s3_key    = var.package_type == "Zip" && var.s3_key != null ? var.s3_key : null
  
  handler          = var.package_type == "Zip" ? var.handler : null
  runtime          = var.package_type == "Zip" ? var.runtime : null

  # For container images
  image_uri = var.package_type == "Image" ? var.image_uri : null

  # Configuration
  timeout     = var.timeout
  memory_size = var.memory_size

  # Ephemeral storage
  ephemeral_storage {
    size = var.ephemeral_storage_size
  }

  # VPC configuration
  dynamic "vpc_config" {
    for_each = var.vpc_id != null ? [1] : []
    content {
      subnet_ids         = var.subnet_ids
      security_group_ids = var.security_group_ids
    }
  }

  # Environment variables
  dynamic "environment" {
    for_each = length(var.environment_variables) > 0 ? [1] : []
    content {
      variables = var.environment_variables
    }
  }

  # Reserved concurrency
  reserved_concurrent_executions = var.reserved_concurrent_executions

  # Tracing
  dynamic "tracing_config" {
    for_each = var.enable_xray ? [1] : []
    content {
      mode = "Active"
    }
  }

  tags = merge(
    var.tags,
    {
      Name = var.function_name
    }
  )

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_cloudwatch_log_group.lambda
  ]
}

# ==============================================================================
# Lambda Function URL (optional)
# ==============================================================================
resource "aws_lambda_function_url" "this" {
  count = var.create_function_url ? 1 : 0

  function_name      = aws_lambda_function.this.function_name
  authorization_type = var.function_url_auth_type

  dynamic "cors" {
    for_each = var.function_url_cors != null ? [var.function_url_cors] : []
    content {
      allow_credentials = lookup(cors.value, "allow_credentials", false)
      allow_headers     = lookup(cors.value, "allow_headers", ["*"])
      allow_methods     = lookup(cors.value, "allow_methods", ["*"])
      allow_origins     = lookup(cors.value, "allow_origins", ["*"])
      expose_headers    = lookup(cors.value, "expose_headers", [])
      max_age           = lookup(cors.value, "max_age", 0)
    }
  }
}
