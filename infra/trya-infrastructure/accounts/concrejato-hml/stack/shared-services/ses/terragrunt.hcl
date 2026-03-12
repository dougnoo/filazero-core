# =============================================================================
# Shared Services - SES Configuration (Admin Trya Dev)
# =============================================================================

terraform {
  source = "../../../../../modules/messaging/ses"
}

include "root" {
  path = find_in_parent_folders()
}

locals {
  # Lê configurações da conta
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
}

# Dependência da zona Route53 no management account
dependency "route53_zone" {
  config_path = "../../../../../management/route53/trya.ai"
  
  mock_outputs = {
    zone_id = "Z35SXDOTRQ7X7K"
  }
}

# Dependência do cross-account role para configurar Route53
dependency "cross_account_role" {
  config_path = "../../../../../management/route53/cross-account-role"
  
  mock_outputs = {
    role_arn = "arn:aws:iam::770922560928:role/ACMRoute53CrossAccountAccess"
  }
}

# Provider para DNS no management account
generate "dns_provider" {
  path      = "dns_provider.tf"
  if_exists = "overwrite"
  contents  = <<EOF
provider "aws" {
  alias  = "dns"
  region = "us-east-1"
  
  assume_role {
    role_arn    = "${dependency.cross_account_role.outputs.role_arn}"
    external_id = "acm-dns-validation"
  }
}
EOF
}

inputs = {
  # Domínio específico para dev
  domain = "dev.admin.trya.ai"
  
  # DKIM desabilitado em dev
  enable_dkim = false
  
  # Emails para verificação individual
#  email_identities = [
#    "noreply@trya.ai"
#  ]
  
  # Configuration Set
  create_configuration_set = true
  configuration_set_name = "${local.account_vars.locals.account_name}-ses-config"
  
  # TLS obrigatório
  tls_policy = "Require"
  
  # CloudWatch para métricas básicas
  enable_cloudwatch_destination = false
  
  # Política para Cognito
  create_cognito_policy = true
  
  # Cross-account Route53 configuration
  # route53_zone_id = dependency.route53_zone.outputs.zone_id
  
  tags = {
    Name        = "${local.account_vars.locals.account_name}-ses"
    Environment = "dev"
    Service     = "shared-services"
    Purpose     = "email-service"
  }
}