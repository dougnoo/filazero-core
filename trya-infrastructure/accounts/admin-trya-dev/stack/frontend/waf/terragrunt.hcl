# =============================================================================
# Frontend WAF Configuration - APENAS PRODUÇÃO
# =============================================================================

terraform {
  source = local.create_waf ? "../../../../../modules/security/waf" : "../../../../../modules/security/waf"
}

include "root" {
  path = find_in_parent_folders()
}

include "envcommon" {
  path = "../../../../_envcommon/frontend.hcl"
}

# Skip este módulo se não for produção
skip = !local.create_waf

locals {
  # Lê configurações da conta
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  
  # Extrai environment do nome da conta
  account_name = local.account_vars.locals.account_name
  name_parts = split("-", local.account_name)
  environment = element(local.name_parts, length(local.name_parts) - 1)
  
  # WAF apenas em produção
  create_waf = local.environment == "prod"
  
  # Configurações do WAF baseadas no environment
  waf_config = {
    # Rate limiting baseado no environment
    rate_limit = local.environment == "prod" ? 5000 : 2000
    
    # Regras mais restritivas em produção
    enable_geo_blocking = local.environment == "prod"
    enable_ip_reputation = local.environment == "prod"
    enable_known_bad_inputs = true
    enable_sql_injection = true
    enable_xss = true
  }
}

inputs = {
  name = "${local.account_vars.locals.account_name}-frontend-waf"
  scope = "CLOUDFRONT"  # WAF para CloudFront (deve ser criado em us-east-1)
  
  # Rate limiting
  rate_limit_per_5min = local.waf_config.rate_limit
  
  # Regras de segurança
  enable_aws_managed_rules = true
  enable_rate_limiting = true
  enable_geo_blocking = local.waf_config.enable_geo_blocking
  enable_ip_reputation = local.waf_config.enable_ip_reputation
  
  # Proteções específicas
  enable_known_bad_inputs_rule = local.waf_config.enable_known_bad_inputs
  enable_sql_injection_rule = local.waf_config.enable_sql_injection
  enable_xss_rule = local.waf_config.enable_xss
  
  # Países permitidos (Brasil e EUA)
  allowed_countries = ["BR", "US"]
  
  # IPs bloqueados (exemplo)
  blocked_ips = []
  
  # IPs permitidos (exemplo - IPs da empresa)
  allowed_ips = []
  
  tags = {
    Name        = "${local.account_vars.locals.account_name}-frontend-waf"
    Service     = "frontend"
    Environment = local.environment
    Purpose     = "cloudfront-protection"
  }
}