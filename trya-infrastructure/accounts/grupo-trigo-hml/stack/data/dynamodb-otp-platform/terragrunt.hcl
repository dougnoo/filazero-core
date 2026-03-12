# =============================================================================
# DynamoDB OTP Codes Table Configuration
# =============================================================================

terraform {
  source = "../../../../../modules/data/dynamodb"
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
  
  # Configurações do DynamoDB baseadas no environment
  dynamodb_config = {
    billing_mode = "PAY_PER_REQUEST"
    ttl_enabled = true
    ttl_attribute = "expires_at"
    enable_point_in_time_recovery = local.environment == "prod"
  }
}

inputs = {
  table_name   = "${local.account_vars.locals.account_name}-platform-otp-codes"
  billing_mode = local.dynamodb_config.billing_mode
  hash_key     = "email"
  
  attributes = [
    {
      name = "email"
      type = "S"
    }
  ]
  
  ttl_enabled        = local.dynamodb_config.ttl_enabled
  ttl_attribute_name = local.dynamodb_config.ttl_attribute
  
  enable_point_in_time_recovery = local.dynamodb_config.enable_point_in_time_recovery
  enable_encryption              = true
  
  tags = {
    Name        = "${local.account_vars.locals.account_name}-otp-codes"
    Purpose     = "OTP Code Storage"
    Environment = local.environment
  }
}