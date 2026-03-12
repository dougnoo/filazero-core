# =============================================================================
# VPC Configuration
# =============================================================================

terraform {
  source = "../../../../../modules/networking/vpc"
}

include "root" {
  path = find_in_parent_folders()
}

inputs = {
  name               = "${local.account_vars.locals.account_name}-vpc"
  vpc_cidr           = "10.0.0.0/16"
  az_count           = 2
  enable_nat_gateway = true
  enable_flow_logs   = false  # Habilitar em prod
  
  tags = {
    Name = "${local.account_vars.locals.account_name}-vpc"
  }
}

locals {
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
}
