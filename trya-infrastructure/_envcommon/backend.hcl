# =============================================================================
# Backend Service Common Configuration - Admin Trya Dev
# =============================================================================
# Configurações compartilhadas para o serviço trya-backend (ambiente dev)

locals {
  # Configurações comuns do backend para desenvolvimento
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
    
    # Fargate Spot (habilitado em dev)
    enable_fargate_spot = true
    fargate_weight = 1
    fargate_spot_weight = 2
    
    # Aurora (configuração para dev)
    use_aurora = true
    aurora_min_capacity = 0.5
    aurora_max_capacity = 4
    aurora_reader_count = 0
    
    # WAF (limite mais alto para dev/teste)
    waf_rate_limit = 2000
    
    # ALB
    enable_https = true
    enable_https_redirect = true
  }
}
