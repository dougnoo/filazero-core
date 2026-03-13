# ─── FilaZero Lambda Module ────────────────────────────────
# Serverless functions for AI chat agents (clinical intake, triage)

variable "project_name" { type = string }
variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "dynamodb_intake_table" { type = string }
variable "dynamodb_chat_table" { type = string }
variable "cognito_user_pool_id" { type = string }

# ─── Lambda Execution Role ────────────────────────────────
resource "aws_iam_role" "lambda" {
  name = "${var.project_name}-${var.environment}-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "lambda" {
  name = "${var.project_name}-${var.environment}-lambda-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface"
        ]
        Resource = "*"
      }
    ]
  })
}

# ─── Security Group ───────────────────────────────────────
resource "aws_security_group" "lambda" {
  name_prefix = "${var.project_name}-${var.environment}-lambda-"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ─── Clinical Intake Agent ────────────────────────────────
resource "aws_lambda_function" "intake_agent" {
  function_name = "${var.project_name}-${var.environment}-intake-agent"
  runtime       = "python3.12"
  handler       = "handler.lambda_handler"
  role          = aws_iam_role.lambda.arn
  timeout       = 120
  memory_size   = 512

  # Placeholder - actual deployment via CI/CD
  filename = "${path.module}/placeholder.zip"

  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      ENVIRONMENT          = var.environment
      DYNAMODB_INTAKE_TABLE = var.dynamodb_intake_table
      DYNAMODB_CHAT_TABLE   = var.dynamodb_chat_table
      BEDROCK_MODEL_ID     = "anthropic.claude-3-5-sonnet-20241022-v2:0"
      BEDROCK_REGION       = "us-east-1"
      COGNITO_USER_POOL_ID = var.cognito_user_pool_id
    }
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
    Agent       = "intake"
  }
}

# ─── Priority Scorer Agent ────────────────────────────────
resource "aws_lambda_function" "priority_scorer" {
  function_name = "${var.project_name}-${var.environment}-priority-scorer"
  runtime       = "python3.12"
  handler       = "handler.lambda_handler"
  role          = aws_iam_role.lambda.arn
  timeout       = 30
  memory_size   = 256

  filename = "${path.module}/placeholder.zip"

  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      ENVIRONMENT            = var.environment
      DYNAMODB_QUEUE_TABLE   = "${var.project_name}-${var.environment}-triage-queue"
      BEDROCK_MODEL_ID       = "anthropic.claude-3-5-sonnet-20241022-v2:0"
      BEDROCK_REGION         = "us-east-1"
    }
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
    Agent       = "priority-scorer"
  }
}

# ─── API Gateway (WebSocket for chat) ─────────────────────
resource "aws_apigatewayv2_api" "chat_ws" {
  name                       = "${var.project_name}-${var.environment}-chat"
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
}

resource "aws_apigatewayv2_integration" "chat" {
  api_id             = aws_apigatewayv2_api.chat_ws.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.intake_agent.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "connect" {
  api_id    = aws_apigatewayv2_api.chat_ws.id
  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.chat.id}"
}

resource "aws_apigatewayv2_route" "disconnect" {
  api_id    = aws_apigatewayv2_api.chat_ws.id
  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.chat.id}"
}

resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.chat_ws.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.chat.id}"
}

resource "aws_apigatewayv2_stage" "chat" {
  api_id      = aws_apigatewayv2_api.chat_ws.id
  name        = var.environment
  auto_deploy = true
}

# ─── Outputs ──────────────────────────────────────────────
output "intake_agent_arn" {
  value = aws_lambda_function.intake_agent.arn
}

output "priority_scorer_arn" {
  value = aws_lambda_function.priority_scorer.arn
}

output "chat_ws_url" {
  value = aws_apigatewayv2_stage.chat.invoke_url
}
