# =============================================================================
# Security Group - Lambda
# =============================================================================

terraform {
  source = "../../../../../modules/security/lambda-sg"
}

include "root" {
  path = find_in_parent_folders()
}

# =============================================================================
# Dependencies
# =============================================================================

dependency "vpc" {
  config_path = "../../shared-services/vpc"
  
  mock_outputs = {
    vpc_id                          = "vpc-mock123456"
    vpc_cidr                        = "10.0.0.0/16"
    vpc_endpoints_security_group_id = "sg-mockendpoints"
  }
  
  mock_outputs_allowed_terraform_commands = ["plan", "validate"]
}

dependency "backend_alb" {
  config_path = "../../backend/alb"
  
  skip_outputs = true
  
  mock_outputs = {
    security_group_id = "sg-mockalb"
  }
  
  mock_outputs_allowed_terraform_commands = ["plan", "validate"]
}

dependency "elasticache" {
  config_path = "../../data/elasticache"
  
  skip_outputs = true
  
  mock_outputs = {
    security_group_id = "sg-mockcache"
  }
  
  mock_outputs_allowed_terraform_commands = ["plan", "validate"]
}

# =============================================================================
# Locals
# =============================================================================

locals {
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  account_name = local.account_vars.locals.account_name
  name_parts   = split("-", local.account_name)
  environment  = element(local.name_parts, length(local.name_parts) - 1)
}

# =============================================================================
# Inputs
# =============================================================================

inputs = {
  name_prefix = "${local.account_name}-lambda"
  description = "Security group for Lambda functions"
  vpc_id      = dependency.vpc.outputs.vpc_id

  vpc_cidr            = dependency.vpc.outputs.vpc_cidr
  vpc_endpoints_sg_id = dependency.vpc.outputs.vpc_endpoints_security_group_id
  backend_alb_sg_id   = try(dependency.backend_alb.outputs.security_group_id, null)
  elasticache_sg_id   = try(dependency.elasticache.outputs.security_group_id, null)

  # Permitir ingress da VPC
  allow_ingress_from_vpc = true

  tags = {
    Name        = "${local.account_name}-lambda-sg"
    Environment = local.environment
    Service     = "security"
    Purpose     = "lambda-networking"
    ManagedBy   = "terragrunt"
  }
}
