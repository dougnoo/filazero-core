# =============================================================================
# ElastiCache Serverless Configuration
# =============================================================================

terraform {
  source = "../../../../../modules/data/elasticache"
}

include "root" {
  path = find_in_parent_folders()
}

dependency "vpc" {
  config_path = "../../shared-services/vpc"
  
  mock_outputs = {
    vpc_id = "vpc-mock123456"
    public_subnet_ids = ["subnet-mock123", "subnet-mock456"]
    private_subnet_ids = ["subnet-mock789", "subnet-mock012"]
  }
}

dependency "ecs_backend" {
  config_path = "../../backend/ecs"
  
  mock_outputs = {
    security_group_id = "sg-ecs-backend-mock123"
  }
}

locals {
  # Lê configurações da conta
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  
  # Configurações do ElastiCache
  elasticache_config = {
    engine = "valkey"
  }
}

inputs = {
  cache_name = "${local.account_vars.locals.account_name}-cache"
  engine     = local.elasticache_config.engine
  description = "Cache for chat sessions"
  
  vpc_id     = dependency.vpc.outputs.vpc_id
  subnet_ids = dependency.vpc.outputs.private_subnet_ids
  
  # Security Groups - Permitir acesso do ECS Backend
  allowed_security_groups = [dependency.ecs_backend.outputs.security_group_id]
  allowed_cidr_blocks     = []  # Remover CIDR, usar apenas SGs específicos
  
  tags = {
    Name = "${local.account_vars.locals.account_name}-cache"
  }
}
