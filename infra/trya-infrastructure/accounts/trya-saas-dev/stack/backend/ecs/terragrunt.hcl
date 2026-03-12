# =============================================================================
# Backend ECS Service Configuration
# =============================================================================

terraform {
  source = "../../../../../modules/compute/ecs-service"
}

include "root" {
  path = find_in_parent_folders()
}

include "envcommon" {
  path   = "${dirname(find_in_parent_folders())}/_envcommon/backend.hcl"
  expose = true
  merge_strategy = "deep"
}

dependency "vpc" {
  config_path = "../../networking/vpc"
}

dependency "ecr" {
  config_path = "../ecr"
}

dependency "alb" {
  config_path = "../alb"
}

dependency "aurora" {
  config_path = "../../data/aurora"
}

inputs = merge(
  include.envcommon.locals.common_vars,
  {
    cluster_name = "${local.account_vars.locals.account_name}-backend-cluster"
    service_name = "${local.account_vars.locals.account_name}-backend-service"
    
    vpc_id     = dependency.vpc.outputs.vpc_id
    subnet_ids = dependency.vpc.outputs.private_subnet_ids
    
    container_image = "${dependency.ecr.outputs.repository_url}:latest"
    container_name  = "trya-backend"
    
    target_group_arn = dependency.alb.outputs.target_group_arn
    
    assign_public_ip = false
    
    cognito_user_pool_arn = null  # TODO: Adicionar Cognito
    
    environment_variables = [
      { name = "NODE_ENV", value = "development" },
      { name = "PORT", value = "3000" },
      { name = "POSTGRES_HOST", value = dependency.aurora.outputs.cluster_endpoint },
      { name = "POSTGRES_PORT", value = "5432" },
      { name = "POSTGRES_DB", value = "trya" },
    ]
    
    secrets = []  # TODO: Adicionar secrets do Secrets Manager
    
    tags = {
      Name    = "${local.account_vars.locals.account_name}-backend"
      Service = "backend"
    }
  }
)

locals {
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
}
