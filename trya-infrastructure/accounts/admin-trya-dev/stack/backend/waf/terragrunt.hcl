# =============================================================================
# Backend WAF Configuration
# =============================================================================

terraform {
  source = "../../../../../modules/security/waf"
}

include "root" {
  path = find_in_parent_folders()
}

dependency "alb" {
  config_path = "../alb"
  
  mock_outputs = {
    load_balancer_arn = "arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/mock-alb/1234567890123456"
  }
}

locals {
  # Lê configurações da conta
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  
  # Extrai environment do nome da conta
  account_name = local.account_vars.locals.account_name
  name_parts = split("-", local.account_name)
  environment = element(local.name_parts, length(local.name_parts) - 1)
  
  # Configurações do WAF baseadas no environment
  waf_config = {
    rate_limit = local.environment == "prod" ? 5000 : 2000
  }
}

inputs = {
  name        = "${local.account_vars.locals.account_name}-backend-waf"
  description = "WAF for backend API"
  scope       = "REGIONAL"
  
  alb_arn = dependency.alb.outputs.load_balancer_arn
  
  enable_rate_limiting = true
  rate_limit           = local.waf_config.rate_limit
  
  enable_ip_block_list = false
  enable_geo_blocking  = false
  
  enable_logging     = true
  log_retention_days = 30
  
  tags = {
    Name    = "${local.account_vars.locals.account_name}-backend-waf"
    Service = "backend"
  }
}
