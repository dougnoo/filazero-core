# =============================================================================
# Platform Backend Service Common Configuration
# =============================================================================
# Configurações compartilhadas para o serviço trya-platform-backend

locals {
  # Configurações comuns do platform-backend
  common_vars = {
    # ECS
    container_port = 3000
    health_check_path = "/api/health"
    task_cpu = 512
    task_memory = 1024
    desired_count = 0
    
    # Auto Scaling
    enable_autoscaling = true
    autoscaling_min_capacity = 2
    autoscaling_max_capacity = 8
    autoscaling_cpu_target = 70
    autoscaling_memory_target = 80
    
    # Container Insights
    enable_container_insights = true
    log_retention_days = 30
    
    # Deployment
    deployment_circuit_breaker_enable = true
    deployment_circuit_breaker_rollback = true
    
    # Fargate Spot (apenas dev)
    enable_fargate_spot = var.environment == "dev"
    fargate_weight = 1
    fargate_spot_weight = var.environment == "dev" ? 2 : 0
    
    # Aurora
    use_aurora = true
    aurora_min_capacity = var.environment == "prod" ? 1 : 0.5
    aurora_max_capacity = var.environment == "prod" ? 8 : 4
    aurora_reader_count = var.environment == "prod" ? 1 : 0
    
    # WAF
    waf_rate_limit = var.environment == "prod" ? 5000 : 2000
    
    # ALB
    enable_https = true
    enable_https_redirect = true
    
    # S3
    enable_versioning = var.environment == "prod"
    enable_lifecycle = true
  }
}
