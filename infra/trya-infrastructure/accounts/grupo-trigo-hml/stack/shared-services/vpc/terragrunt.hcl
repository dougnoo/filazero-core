# =============================================================================
# Shared Services - VPC Configuration
# =============================================================================

terraform {
  source = "../../../../../modules/networking/vpc"
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
}

inputs = {
  name               = "${local.account_vars.locals.account_name}-vpc"
  vpc_cidr           = "10.20.0.0/16"
  az_count           = 2
  enable_nat_gateway = true
  enable_flow_logs   = false
  
  # VPC Endpoints
  enable_vpc_endpoints = true
  vpc_endpoints        = ["s3", "dynamodb", "bedrock", "transcribe"]
  
  tags = {
    Name        = "${local.account_vars.locals.account_name}-vpc"
    Environment = local.environment
    Service     = "shared-services"
    Purpose     = "networking"
  }
}