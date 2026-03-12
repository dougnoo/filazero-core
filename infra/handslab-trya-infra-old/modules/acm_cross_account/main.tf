# =============================================================================
# ACM Cross-Account Certificate
# =============================================================================
# 
# Cria certificado ACM em uma conta e exporta os registros de validação DNS
# para serem criados na conta onde está a hosted zone.
#
# Uso típico:
# 1. Aplique este módulo na conta HML
# 2. Copie os outputs de validação (CNAME records)
# 3. Crie os registros na conta DNS (manualmente ou via Terraform)
# 4. Aguarde validação
# =============================================================================

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Certificado ACM
resource "aws_acm_certificate" "this" {
  domain_name               = var.domain_name
  subject_alternative_names = var.subject_alternative_names
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(
    var.tags,
    {
      Name        = "${var.domain_name}-certificate"
      Environment = var.environment
    }
  )
}

# Aguarda validação (opcional - só funciona se os registros DNS já existirem)
resource "aws_acm_certificate_validation" "this" {
  count = var.wait_for_validation ? 1 : 0

  certificate_arn = aws_acm_certificate.this.arn

  timeouts {
    create = var.validation_timeout
  }
}
