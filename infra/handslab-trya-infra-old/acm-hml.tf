# =============================================================================
# Certificados ACM para ambiente HML
# =============================================================================
#
# Este arquivo cria os certificados ACM na conta HML.
# A validação DNS deve ser feita na conta onde está a hosted zone (Dev/DNS).
#
# Workflow:
# 1. terraform apply (cria certificados pendentes)
# 2. Copie os outputs de validação DNS
# 3. Crie os registros CNAME na conta DNS (manual ou via CLI)
# 4. Aguarde validação (geralmente 5-30 minutos)
# =============================================================================

# Só cria certificados quando estiver no ambiente HML
locals {
  is_hml = var.environment == "hml"
}

# Certificado para ALB (backend APIs) - Regional (sa-east-1)
module "acm_hml_backend" {
  source = "./modules/acm_cross_account"
  count  = local.is_hml ? 1 : 0

  domain_name = "api-hml.${var.domain_name}"
  subject_alternative_names = [
    "chat-hml.${var.domain_name}",
    "platform-hml.${var.domain_name}"
  ]

  environment         = var.environment
  wait_for_validation = false  # Não aguardar - validação é cross-account

  tags = local.common_tags
}

# Certificado para CloudFront (frontend) - DEVE ser em us-east-1
# Nota: Este recurso usa o provider us_east_1 definido em provider.tf
module "acm_hml_frontend" {
  source = "./modules/acm_cross_account"
  count  = local.is_hml ? 1 : 0

  providers = {
    aws = aws.us_east_1
  }

  domain_name               = "hml.${var.domain_name}"
  subject_alternative_names = []

  environment         = var.environment
  wait_for_validation = false

  tags = local.common_tags
}

# =============================================================================
# Outputs para validação DNS
# =============================================================================

output "hml_backend_certificate_arn" {
  description = "ARN do certificado ACM para backend APIs (HML)"
  value       = local.is_hml ? module.acm_hml_backend[0].certificate_arn : null
}

output "hml_backend_dns_validation" {
  description = "Registros DNS para validar certificado backend (criar na conta DNS)"
  value       = local.is_hml ? module.acm_hml_backend[0].dns_validation_records : null
}

output "hml_frontend_certificate_arn" {
  description = "ARN do certificado ACM para frontend (HML) - us-east-1"
  value       = local.is_hml ? module.acm_hml_frontend[0].certificate_arn : null
}

output "hml_frontend_dns_validation" {
  description = "Registros DNS para validar certificado frontend (criar na conta DNS)"
  value       = local.is_hml ? module.acm_hml_frontend[0].dns_validation_records : null
}

output "hml_validation_cli_commands" {
  description = "Comandos CLI para criar registros de validação (executar na conta DNS)"
  value = local.is_hml ? concat(
    module.acm_hml_backend[0].cli_validation_commands,
    module.acm_hml_frontend[0].cli_validation_commands
  ) : null
}
