# =============================================================================
# Frontend Service Common Configuration
# =============================================================================
# Configurações compartilhadas para o serviço trya-frontend

locals {
  # Lê configurações da conta para extrair environment
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  
  # Extrai environment do nome da conta (admin-trya-dev -> dev)
  account_name = local.account_vars.locals.account_name
  name_parts = split("-", local.account_name)
  environment = element(local.name_parts, length(local.name_parts) - 1)
  
  # Configurações comuns do frontend
  common_vars = {
    # ECS
    container_port = 3000
    health_check_path = "/api/health"
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
    
    # ALB
    enable_https = true
    enable_https_redirect = true
    
    # CloudFront - HABILITADO EM TODOS OS AMBIENTES
    enable_cloudfront = true
    cloudfront_price_class = local.environment == "prod" ? "PriceClass_All" : "PriceClass_100"
    enable_ipv6 = true
    
    # WAF apenas em produção
    enable_waf = local.environment == "prod"
  }
}
