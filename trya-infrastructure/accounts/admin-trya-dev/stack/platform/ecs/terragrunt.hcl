# =============================================================================
# Backend ECS Service Configuration
# =============================================================================

terraform {
  source = "../../../../../modules/compute/ecs-service"
}

include "root" {
  path = find_in_parent_folders()
}

dependency "vpc" {
  config_path = "../../shared-services/vpc"
  
  mock_outputs = {
    vpc_id = "vpc-mock123456"
    vpc_cidr = "10.0.0.0/16"
    public_subnet_ids = ["subnet-mock123", "subnet-mock456"]
    private_subnet_ids = ["subnet-mock789", "subnet-mock012"]
  }
}

dependency "ecr" {
  config_path = "../ecr"
  
  mock_outputs = {
    repository_url = "123456789012.dkr.ecr.us-east-1.amazonaws.com/mock-repo"
  }
}

dependency "alb" {
  config_path = "../alb"
  
  mock_outputs = {
    target_group_arn = "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/mock-tg/1234567890123456"
    security_group_id = "sg-alb-mock123"
  }
}

dependency "aurora" {
  config_path = "../../data/aurora"
  
  mock_outputs = {
    cluster_endpoint = "mock-aurora-cluster.cluster-xyz.us-east-1.rds.amazonaws.com"
    security_group_id = "sg-aurora-mock123"
  }
}

locals {
  # Lê configurações da conta
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  
  # Extrai environment do nome da conta (admin-trya-dev -> dev)
  account_name = local.account_vars.locals.account_name
  name_parts = split("-", local.account_name)
  environment = element(local.name_parts, length(local.name_parts) - 1)
  
  # Configurações baseadas no environment
  common_vars = {
    # ECS
    container_port = 3000
    health_check_path = "/api/health"
    task_cpu = 512
    task_memory = 1024
    desired_count = 2
    
    # Auto Scaling
    enable_autoscaling = true
    autoscaling_min_capacity = 2
    autoscaling_max_capacity = 10
    autoscaling_cpu_target = 70
    autoscaling_memory_target = 80
    
    # Container Insights
    enable_container_insights = true
    log_retention_days = 30
    
    # Deployment
    deployment_circuit_breaker_enable = true
    deployment_circuit_breaker_rollback = true
    
    # Fargate Spot (apenas dev)
    enable_fargate_spot = local.environment == "dev"
    fargate_weight = 1
    fargate_spot_weight = local.environment == "dev" ? 2 : 0
    
    # Aurora
    use_aurora = true
    aurora_min_capacity = local.environment == "prod" ? 1 : 0.5
    aurora_max_capacity = local.environment == "prod" ? 8 : 4
    aurora_reader_count = local.environment == "prod" ? 1 : 0
    
    # WAF
    waf_rate_limit = local.environment == "prod" ? 5000 : 2000
    
    # ALB
    enable_https = true
    enable_https_redirect = true
  }
}

inputs = merge(
  local.common_vars,
  {
    cluster_name = "${local.account_vars.locals.account_name}-platform-cluster"
    service_name = "${local.account_vars.locals.account_name}-platform-service"
    task_name = "${local.account_vars.locals.account_name}-platform-task"
    
    vpc_id     = dependency.vpc.outputs.vpc_id
    vpc_cidr   = dependency.vpc.outputs.vpc_cidr
    subnet_ids = dependency.vpc.outputs.private_subnet_ids
    
    container_image = "${dependency.ecr.outputs.repository_url}:latest"
    container_name  = "trya-platform"
    
    target_group_arn = dependency.alb.outputs.target_group_arn
    
    # Security Groups
    alb_security_group_id = dependency.alb.outputs.security_group_id
    aurora_security_group_ids = [dependency.aurora.outputs.security_group_id]
    
    assign_public_ip = false
    
    cognito_user_pool_arn = null  # TODO: Adicionar Cognito
    
    environment_variables = [
      { name = "NODE_ENV", value = local.environment == "prod" ? "production" : "development" },
      { name = "PORT", value = "3000" },
      { name = "POSTGRES_HOST", value = dependency.aurora.outputs.cluster_endpoint },
      { name = "POSTGRES_PORT", value = "5432" },
      { name = "POSTGRES_DB", value = "trya" },
    ]
    
    secrets = []  # TODO: Adicionar secrets do Secrets Manager
    
    tags = {
      Name    = "${local.account_vars.locals.account_name}-platform"
      Service = "platform"
    }
  }
)
