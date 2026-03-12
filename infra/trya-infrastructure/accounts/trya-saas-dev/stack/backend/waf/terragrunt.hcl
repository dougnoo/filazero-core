# =============================================================================
# Backend WAF Configuration
# =============================================================================

terraform {
  source = "../../../../../modules/security/waf"
}

include "root" {
  path = find_in_parent_folders()
}

include "envcommon" {
  path   = "${dirname(find_in_parent_folders())}/_envcommon/backend.hcl"
  expose = true
}

dependency "alb" {
  config_path = "../alb"
}

inputs = {
  name        = "${local.account_vars.locals.account_name}-backend-waf"
  description = "WAF for backend API"
  scope       = "REGIONAL"
  
  alb_arn = dependency.alb.outputs.load_balancer_arn
  
  enable_rate_limiting = true
  rate_limit           = include.envcommon.locals.common_vars.waf_rate_limit
  
  enable_ip_block_list = false
  enable_geo_blocking  = false
  
  enable_logging     = true
  log_retention_days = 30
  
  tags = {
    Name    = "${local.account_vars.locals.account_name}-backend-waf"
    Service = "backend"
  }
}

locals {
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
}
