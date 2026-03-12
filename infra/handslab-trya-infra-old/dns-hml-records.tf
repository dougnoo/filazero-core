# =============================================================================
# DNS Records para ambiente HML (Cross-Account)
# =============================================================================
# 
# Este arquivo cria os registros DNS para o ambiente HML.
# IMPORTANTE: Deve ser aplicado NA CONTA ONDE ESTÁ A HOSTED ZONE (conta Dev/DNS)
#
# Os valores dos ALB/CloudFront do HML devem ser obtidos após provisionar
# a infraestrutura na conta HML e passados via variáveis.
# =============================================================================

# Variáveis para endpoints HML (preenchidas após provisionar infra HML)
variable "hml_alb_dns_name" {
  description = "DNS name do ALB do ambiente HML"
  type        = string
  default     = ""  # Será preenchido após terraform apply na conta HML
}

variable "hml_alb_zone_id" {
  description = "Zone ID do ALB do ambiente HML (para sa-east-1: Z2P70J7HTTTPLU)"
  type        = string
  default     = "Z2P70J7HTTTPLU"  # ALB hosted zone ID para sa-east-1
}

variable "hml_cloudfront_domain_name" {
  description = "Domain name da distribuição CloudFront do HML"
  type        = string
  default     = ""  # Será preenchido após terraform apply na conta HML
}

variable "hml_cloudfront_zone_id" {
  description = "Zone ID do CloudFront (fixo para todas as distribuições)"
  type        = string
  default     = "Z2FDTNDATAQYW2"  # CloudFront hosted zone ID (global)
}

variable "enable_hml_dns_records" {
  description = "Habilitar criação dos registros DNS do HML"
  type        = bool
  default     = false  # Desabilitado por padrão até ter os valores do HML
}

# =============================================================================
# Registros DNS para HML
# =============================================================================

# Frontend HML -> CloudFront
resource "aws_route53_record" "hml_frontend" {
  count = var.enable_hml_dns_records && var.hml_cloudfront_domain_name != "" ? 1 : 0

  zone_id = var.create_route53_zone ? module.route53[0].zone_id : data.aws_route53_zone.main[0].zone_id
  name    = "hml.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.hml_cloudfront_domain_name
    zone_id                = var.hml_cloudfront_zone_id
    evaluate_target_health = false
  }
}

# Backend API HML -> ALB
resource "aws_route53_record" "hml_api" {
  count = var.enable_hml_dns_records && var.hml_alb_dns_name != "" ? 1 : 0

  zone_id = var.create_route53_zone ? module.route53[0].zone_id : data.aws_route53_zone.main[0].zone_id
  name    = "api-hml.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.hml_alb_dns_name
    zone_id                = var.hml_alb_zone_id
    evaluate_target_health = true
  }
}

# Chat API HML -> ALB (se separado)
resource "aws_route53_record" "hml_chat_api" {
  count = var.enable_hml_dns_records && var.hml_alb_dns_name != "" ? 1 : 0

  zone_id = var.create_route53_zone ? module.route53[0].zone_id : data.aws_route53_zone.main[0].zone_id
  name    = "chat-hml.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.hml_alb_dns_name
    zone_id                = var.hml_alb_zone_id
    evaluate_target_health = true
  }
}

# Platform API HML -> ALB (se separado)
resource "aws_route53_record" "hml_platform_api" {
  count = var.enable_hml_dns_records && var.hml_alb_dns_name != "" ? 1 : 0

  zone_id = var.create_route53_zone ? module.route53[0].zone_id : data.aws_route53_zone.main[0].zone_id
  name    = "platform-hml.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.hml_alb_dns_name
    zone_id                = var.hml_alb_zone_id
    evaluate_target_health = true
  }
}
