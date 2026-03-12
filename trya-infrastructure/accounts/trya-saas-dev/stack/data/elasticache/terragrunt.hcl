# =============================================================================
# ElastiCache Serverless Configuration
# =============================================================================

terraform {
  source = "../../../../../modules/data/elasticache"
}

include "root" {
  path = find_in_parent_folders()
}

include "envcommon" {
  path   = "${dirname(find_in_parent_folders())}/_envcommon/chat-agents.hcl"
  expose = true
}

dependency "vpc" {
  config_path = "../../networking/vpc"
}

inputs = {
  cache_name = "${local.account_vars.locals.account_name}-cache"
  engine     = include.envcommon.locals.common_vars.elasticache_engine
  description = "Cache for chat sessions"
  
  security_group_ids = []  # TODO: Criar security group
  subnet_ids         = dependency.vpc.outputs.private_subnet_ids
  
  tags = {
    Name = "${local.account_vars.locals.account_name}-cache"
  }
}

locals {
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
}
