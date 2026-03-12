# =============================================================================
# Cross-Account Role for ACM DNS Validation
# =============================================================================

include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "${get_repo_root()}/modules/security/acm-cross-account-role"
}

dependency "hosted_zone" {
  config_path = "../trya.ai"
  
  mock_outputs = {
    zone_arn = "arn:aws:route53:::hostedzone/Z1234567890ABC"
    zone_id  = "Z1234567890ABC"
  }
}

locals {
  # Lê configurações da conta management
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  
  # IDs das contas que podem assumir esta role
  trusted_accounts = [
    "751426053736",  # admin-trya-dev
    "957391762020",  # admin-trya-hml 
    "688031085880",  # admin-trya-prod 
    "363160364844",  # grupo-trigo-hml (substituir pelo ID real)
    "274016496290",  # grupo-trigo-prod (substituir pelo ID real)
  ]
}

inputs = {
  role_name           = "ACMRoute53CrossAccountAccess"
  trusted_account_ids = local.trusted_accounts
  
  # ARNs das hosted zones que podem ser modificadas
  route53_zone_arns = [
    dependency.hosted_zone.outputs.zone_arn,
    "arn:aws:route53:::hostedzone/*"  # Permite acesso a todas as zones se necessário
  ]
  
  tags = {
    Name        = "ACM Route53 Cross-Account Access"
    Purpose     = "DNS validation for ACM certificates"
    Environment = "management"
    ManagedBy   = "Terragrunt"
  }
}