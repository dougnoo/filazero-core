# =============================================================================
# Backend ALB Configuration
# =============================================================================

terraform {
  source = "../../../../../modules/cdn/alb"
}

include "root" {
  path = find_in_parent_folders()
}

include "envcommon" {
  path   = "${dirname(find_in_parent_folders())}/_envcommon/backend.hcl"
  expose = true
}

dependency "vpc" {
  config_path = "../../networking/vpc"
}

inputs = {
  name       = "${local.account_vars.locals.account_name}-backend-alb"
  vpc_id     = dependency.vpc.outputs.vpc_id
  subnet_ids = dependency.vpc.outputs.public_subnet_ids
  internal   = false
  
  enable_https          = include.envcommon.locals.common_vars.enable_https
  enable_https_redirect = include.envcommon.locals.common_vars.enable_https_redirect
  certificate_arn       = null  # TODO: Adicionar certificado ACM
  
  target_group_port = include.envcommon.locals.common_vars.container_port
  health_check_path = include.envcommon.locals.common_vars.health_check_path
  
  stickiness_enabled = false
  
  tags = {
    Name    = "${local.account_vars.locals.account_name}-backend-alb"
    Service = "backend"
  }
}

locals {
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
}
