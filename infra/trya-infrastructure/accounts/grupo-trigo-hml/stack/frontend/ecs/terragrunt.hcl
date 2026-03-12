# =============================================================================
# Frontend ECS Service Configuration
# =============================================================================

terraform {
  source = "../../../../../modules/compute/ecs-service"
}

include "root" {
  path = find_in_parent_folders()
}

include "envcommon" {
  path = "../../../../../_envcommon/frontend.hcl"
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
    repository_url = "123456789012.dkr.ecr.us-east-1.amazonaws.com/mock-frontend-repo"
  }
}

dependency "alb" {
  config_path = "../alb"
  
  mock_outputs = {
    target_group_arn = "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/mock-frontend-tg/1234567890123456"
    security_group_id = "sg-alb-frontend-mock123"
  }
}

# Dependência do backend para variáveis de ambiente
dependency "backend_alb" {
  config_path = "../../backend/alb"
  
  mock_outputs = {
    load_balancer_dns_name = "admin-trya-dev-backend-alb-123456789.us-east-1.elb.amazonaws.com"
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
    health_check_path = "/"
    task_cpu = 256
    task_memory = 512
    desired_count = 2
    
    # Auto Scaling
    enable_autoscaling = true
    autoscaling_min_capacity = 2
    autoscaling_max_capacity = 6
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
  }
}

inputs = merge(
  local.common_vars,
  {
    cluster_name = "${local.account_vars.locals.account_name}-frontend-cluster"
    service_name = "${local.account_vars.locals.account_name}-frontend-service"
    task_name = "${local.account_vars.locals.account_name}-frontend-task"
    
    vpc_id     = dependency.vpc.outputs.vpc_id
    subnet_ids = dependency.vpc.outputs.private_subnet_ids
    vpc_cidr   = dependency.vpc.outputs.vpc_cidr
    
    container_image = "${dependency.ecr.outputs.repository_url}:latest"
    container_name  = "trya-frontend"
    
    target_group_arn = dependency.alb.outputs.target_group_arn
    
    # Security Groups
    alb_security_group_id = dependency.alb.outputs.security_group_id
    aurora_security_group_ids = [] # Frontend não acessa banco diretamente
    
    assign_public_ip = false
    
    cognito_user_pool_arn = null  # TODO: Adicionar Cognito
    
    environment_variables = [
      { name = "NODE_ENV", value = local.environment == "prod" ? "production" : "development" },
      { name = "PORT", value = "3000" },
      { name = "HOSTNAME", value = "0.0.0.0" },
      { name = "NEXT_PUBLIC_API_URL", value = "http://${dependency.backend_alb.outputs.load_balancer_dns_name}" },
      { name = "NEXT_PUBLIC_ENVIRONMENT", value = local.environment },
    ]
    
    secrets = []  # TODO: Adicionar secrets do Secrets Manager
    
    tags = {
      Name    = "${local.account_vars.locals.account_name}-frontend"
      Service = "frontend"
    }
  }
)