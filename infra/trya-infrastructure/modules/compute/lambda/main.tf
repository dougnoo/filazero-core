# =============================================================================
# Lambda Function Module
# =============================================================================

# Lambda Function
resource "aws_lambda_function" "this" {
  function_name = var.function_name
  description   = var.description
  role          = aws_iam_role.lambda.arn

  # Code
  filename         = var.filename
  source_code_hash = var.source_code_hash
  handler          = var.handler
  runtime          = var.runtime

  # Resources
  timeout     = var.timeout
  memory_size = var.memory_size

  ephemeral_storage {
    size = var.ephemeral_storage_size
  }

  # VPC Configuration
  dynamic "vpc_config" {
    for_each = var.vpc_config != null ? [var.vpc_config] : []
    content {
      subnet_ids         = vpc_config.value.subnet_ids
      security_group_ids = vpc_config.value.security_group_ids
    }
  }

  # Environment Variables
  dynamic "environment" {
    for_each = length(var.environment_variables) > 0 ? [1] : []
    content {
      variables = var.environment_variables
    }
  }

  # KMS for environment variables
  kms_key_arn = var.kms_key_id

  # Tracing
  tracing_config {
    mode = var.enable_xray ? "Active" : "PassThrough"
  }

  # Reserved Concurrent Executions
  reserved_concurrent_executions = var.reserved_concurrent_executions

  # Dead Letter Queue
  dynamic "dead_letter_config" {
    for_each = var.dead_letter_target_arn != null ? [1] : []
    content {
      target_arn = var.dead_letter_target_arn
    }
  }

  tags = var.tags

  depends_on = [
    aws_iam_role_policy_attachment.lambda_vpc,
    aws_cloudwatch_log_group.lambda
  ]
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = var.log_retention_days
  kms_key_id        = var.kms_key_id

  tags = var.tags
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda" {
  name = "${var.function_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })

  tags = var.tags
}

# Attach VPC execution policy if VPC is configured
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Attach CloudWatch Logs policy
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}

# Bedrock Policy (for AI agents)
resource "aws_iam_role_policy" "lambda_bedrock" {
  count = var.enable_bedrock ? 1 : 0

  name = "${var.function_name}-bedrock-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = "arn:aws:bedrock:*:*:foundation-model/*"
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:Retrieve",
          "bedrock:*"
        ]
        Resource = "*"
      }
    ]
  })
}

# DynamoDB Policy
resource "aws_iam_role_policy" "lambda_dynamodb" {
  count = var.enable_dynamodb ? 1 : 0

  name = "${var.function_name}-dynamodb-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ]
      Resource = var.dynamodb_table_arns != null ? var.dynamodb_table_arns : ["*"]
    }]
  })
}

# S3 Policy
resource "aws_iam_role_policy" "lambda_s3" {
  count = var.enable_s3 ? 1 : 0

  name = "${var.function_name}-s3-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
        Resource = var.s3_bucket_arns != null ? [for arn in var.s3_bucket_arns : "${arn}/*"] : ["*"]
      },
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = var.s3_bucket_arns != null ? var.s3_bucket_arns : ["*"]
      }
    ]
  })
}

# Transcribe Policy
resource "aws_iam_role_policy" "lambda_transcribe" {
  count = var.enable_transcribe ? 1 : 0

  name = "${var.function_name}-transcribe-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "transcribe:StartTranscriptionJob",
        "transcribe:GetTranscriptionJob",
        "transcribe:DeleteTranscriptionJob"
      ]
      Resource = "*"
    }]
  })
}

# ElastiCache Policy
resource "aws_iam_role_policy" "lambda_elasticache" {
  count = var.enable_elasticache ? 1 : 0

  name = "${var.function_name}-elasticache-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["elasticache:Connect"]
      Resource = "*"
    }]
  })
}

# CloudWatch Metrics Policy
resource "aws_iam_role_policy" "lambda_cloudwatch_metrics" {
  name = "${var.function_name}-cloudwatch-metrics-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "cloudwatch:PutMetricData"
      ]
      Resource = "*"
    }]
  })
}

# Custom IAM Policy
resource "aws_iam_role_policy" "lambda_custom" {
  count = var.custom_policy != null ? 1 : 0

  name   = "${var.function_name}-custom-policy"
  role   = aws_iam_role.lambda.id
  policy = var.custom_policy
}

# Lambda Function URL (optional)
resource "aws_lambda_function_url" "this" {
  count = var.enable_function_url ? 1 : 0

  function_name      = aws_lambda_function.this.function_name
  authorization_type = var.function_url_auth_type

  dynamic "cors" {
    for_each = var.function_url_cors != null ? [var.function_url_cors] : []
    content {
      allow_credentials = cors.value.allow_credentials
      allow_origins     = cors.value.allow_origins
      allow_methods     = cors.value.allow_methods
      allow_headers     = cors.value.allow_headers
      expose_headers    = cors.value.expose_headers
      max_age           = cors.value.max_age
    }
  }
}
