# =============================================================================
# Bedrock Module
# =============================================================================
# Note: Foundation Models não precisam ser criados, apenas ter acesso habilitado
# Este módulo gerencia Knowledge Bases e configurações

# Knowledge Base (se necessário criar)
# Nota: Atualmente não há recurso Terraform oficial para Bedrock Knowledge Base
# Precisa ser criado via Console ou AWS CLI

# Data source para verificar modelos disponíveis
data "aws_bedrock_foundation_models" "available" {
  by_provider = "Anthropic"
}

# IAM Role para Lambda invocar Bedrock
resource "aws_iam_role" "bedrock_invoke" {
  count = var.create_invoke_role ? 1 : 0

  name = "${var.name_prefix}-bedrock-invoke"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = var.assume_role_services
      }
    }]
  })

  tags = var.tags
}

# Policy para invocar modelos Bedrock
resource "aws_iam_role_policy" "bedrock_invoke" {
  count = var.create_invoke_role ? 1 : 0

  name = "${var.name_prefix}-bedrock-invoke"
  role = aws_iam_role.bedrock_invoke[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = var.allowed_model_arns
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:Retrieve",
          "bedrock-agent-runtime:Retrieve"
        ]
        Resource = var.knowledge_base_arns
      }
    ]
  })
}
