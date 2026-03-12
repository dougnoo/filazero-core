# =============================================================================
# Aurora PostgreSQL Configuration
# =============================================================================

terraform {
  source = "../../../../../modules/data/aurora"
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
  cluster_identifier = "${local.account_vars.locals.account_name}-aurora"
  database_name      = "trya"
  master_username    = "postgres"
  master_password    = "CHANGE_ME_USE_SECRETS_MANAGER"  # TODO: Usar Secrets Manager
  
  vpc_id     = dependency.vpc.outputs.vpc_id
  subnet_ids = dependency.vpc.outputs.private_subnet_ids
  
  instance_class          = "db.serverless"
  serverless_min_capacity = include.envcommon.locals.common_vars.aurora_min_capacity
  serverless_max_capacity = include.envcommon.locals.common_vars.aurora_max_capacity
  reader_count            = include.envcommon.locals.common_vars.aurora_reader_count
  
  allowed_security_groups = []  # Será preenchido pelos ECS services
  deletion_protection     = false
  skip_final_snapshot     = true
  
  performance_insights_enabled = true
  monitoring_interval          = 60
  create_cloudwatch_alarms     = true
  
  tags = {
    Name = "${local.account_vars.locals.account_name}-aurora"
  }
}

locals {
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
}
