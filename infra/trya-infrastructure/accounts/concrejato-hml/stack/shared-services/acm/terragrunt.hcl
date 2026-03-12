# =============================================================================
# Shared Services - ACM Cross-Account Configuration
# =============================================================================

terraform {
  source = "../../../../modules/security/acm-cross-account"
}

include "root" {
  path = find_in_parent_folders()
}

locals {
  # Lê configurações da conta
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  
  # Extrai environment do nome da conta
  account_name = local.account_vars.locals.account_name
  name_parts = split("-", local.account_name)
  environment = element(local.name_parts, length(local.name_parts) - 1)
  
  # Configurações de domínio baseadas no environment
  domain_config = {
    primary_domain = local.environment == "prod" ? "admin.trya.ai" : 
                    local.environment == "hml" ? "hml.admin.trya.ai" : 
                    "dev.admin.trya.ai"
    
    api_domain = local.environment == "prod" ? "api.admin.trya.ai" : 
                local.environment == "hml" ? "hml-api.admin.trya.ai" : 
                "dev-api.admin.trya.ai"
  }
}

# Dependência do role cross-account no management
dependency "cross_account_role" {
  config_path = "../../../../../management/route53/cross-account-role"
  
  mock_outputs = {
    role_arn = "arn:aws:iam::123456789012:role/Route53CrossAccountRole"
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
    role_arn = "${dependency.cross_account_role.outputs.role_arn}"
  }
}
EOF
}

inputs = {
  domain_name = local.domain_config.primary_domain
  
  subject_alternative_names = [
    local.domain_config.api_domain,
    "*.${local.domain_config.primary_domain}"
  ]
  
  validation_method = "DNS"
  
  # Cross-account DNS validation
  create_route53_records = true
  route53_zone_name = "trya.ai"
  
  tags = {
    Name        = "${local.account_vars.locals.account_name}-ssl-certificate"
    Environment = local.environment
    Service     = "shared-services"
    Purpose     = "ssl-certificate"
  }
}