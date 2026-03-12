# =============================================================================
# DynamoDB Sessions Table Configuration
# =============================================================================

terraform {
  source = "../../../../../modules/data/dynamodb"
}

include "root" {
  path = find_in_parent_folders()
}

include "envcommon" {
  path   = "${dirname(find_in_parent_folders())}/_envcommon/chat-agents.hcl"
  expose = true
}

inputs = {
  table_name   = "${local.account_vars.locals.account_name}-sessions"
  billing_mode = include.envcommon.locals.common_vars.dynamodb_billing_mode
  hash_key     = "session_id"
  
  attributes = [
    {
      name = "session_id"
      type = "S"
    }
  ]
  
  ttl_enabled        = include.envcommon.locals.common_vars.dynamodb_ttl_enabled
  ttl_attribute_name = include.envcommon.locals.common_vars.dynamodb_ttl_attribute
  
  enable_point_in_time_recovery = include.envcommon.locals.common_vars.dynamodb_enable_point_in_time_recovery
  enable_encryption              = true
  
  tags = {
    Name = "${local.account_vars.locals.account_name}-sessions"
  }
}

locals {
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
}
