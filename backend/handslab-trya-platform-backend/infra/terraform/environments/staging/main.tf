# =============================================================================
# Trya Platform Backend - HML (Staging)
# =============================================================================
# Copia do main.tf do dev, adaptado para HML
# =============================================================================

# Data sources para buscar recursos existentes
data "aws_vpc" "main" {
  id = var.vpc_id
}

data "aws_subnets" "public" {
  filter {
    name   = "subnet-id"
    values = var.public_subnet_ids
  }
}

data "aws_subnets" "private" {
  filter {
    name   = "subnet-id"
    values = var.private_subnet_ids
  }
}

data "aws_caller_identity" "current" {}

# ==============================================================================
# ECR - Container Registry
# ==============================================================================
module "ecr" {
  source = "../../modules/ecr"

  repository_name      = "${var.project_name}-hml"  # Nome explicito para HML
  image_tag_mutability = "MUTABLE"
  scan_on_push         = true
  max_image_count      = 15

  tags = local.tags
}

# ==============================================================================
# ALB - Application Load Balancer
# ==============================================================================
module "alb" {
  source = "../../modules/alb"

  name       = "${var.project_name}-hml-alb"
  vpc_id     = data.aws_vpc.main.id
  subnet_ids = data.aws_subnets.public.ids
  internal   = false

  enable_https          = var.enable_https
  enable_https_redirect = var.enable_https_redirect
  certificate_arn       = var.certificate_arn

  target_group_port = 3000
  health_check_path = "/api/health"

  stickiness_enabled = false

  tags = local.tags
}

# Security Group Rules: ALB <-> ECS
resource "aws_security_group_rule" "alb_to_ecs" {
  type                     = "egress"
  from_port                = 3000
  to_port                  = 3000
  protocol                 = "tcp"
  source_security_group_id = module.ecs.security_group_id
  security_group_id        = module.alb.security_group_id
  description              = "Allow ALB to communicate with ECS tasks"
}

resource "aws_security_group_rule" "ecs_from_alb" {
  type                     = "ingress"
  from_port                = 3000
  to_port                  = 3000
  protocol                 = "tcp"
  source_security_group_id = module.alb.security_group_id
  security_group_id        = module.ecs.security_group_id
  description              = "Allow ECS tasks to receive traffic from ALB"
}

# ==============================================================================
# WAF - Web Application Firewall
# ==============================================================================
module "waf" {
  source = "../../modules/waf"

  name        = "${var.project_name}-hml-waf"
  description = "WAF for ${var.project_name} API - HML"
  scope       = "REGIONAL"

  alb_arn = module.alb.load_balancer_arn

  enable_rate_limiting = true
  rate_limit           = var.waf_rate_limit

  enable_ip_block_list = false
  enable_geo_blocking  = false

  enable_logging     = true
  log_retention_days = 30

  tags = local.tags

  depends_on = [module.alb]
}

# ==============================================================================
# ECS - Container Service with Auto Scaling
# ==============================================================================
module "ecs" {
  source = "../../modules/ecs"

  cluster_name = "${var.project_name}-hml-cluster"
  service_name = "${var.project_name}-hml-service"
  vpc_id       = data.aws_vpc.main.id
  subnet_ids   = data.aws_subnets.private.ids

  container_image = "${module.ecr.repository_url}:latest"
  container_name  = "trya-platform-backend"
  container_port  = 3000

  target_group_arn = module.alb.target_group_arn

  task_cpu    = var.task_cpu
  task_memory = var.task_memory

  desired_count    = var.desired_count
  assign_public_ip = true

  # Auto Scaling
  enable_autoscaling        = var.enable_autoscaling
  autoscaling_min_capacity  = var.autoscaling_min_capacity
  autoscaling_max_capacity  = var.autoscaling_max_capacity
  autoscaling_cpu_target    = 70
  autoscaling_memory_target = 80

  # Container Insights & Logging
  enable_container_insights = true
  log_retention_days        = 30

  # Deployment
  deployment_circuit_breaker_enable   = true
  deployment_circuit_breaker_rollback = true
  enable_execute_command              = true  # Habilitado para debugging em HML

  # Fargate Spot desabilitado para HML (mais estavel)
  enable_fargate_spot = false
  fargate_weight      = 1
  fargate_spot_weight = 0

  environment_variables = [
    { name = "NODE_ENV", value = "staging" },
    { name = "PORT", value = "3000" },
    { name = "CORS_ORIGIN", value = var.cors_origin },
    { name = "CORS_CREDENTIALS", value = "true" },
    { name = "FRONTEND_URL", value = var.frontend_url },
    { name = "JWT_EXPIRATION", value = var.jwt_expiration },
    { name = "AWS_REGION", value = var.aws_region },
    { name = "COGNITO_USER_POOL_ID", value = var.cognito_user_pool_id },
    { name = "COGNITO_CLIENT_ID", value = var.cognito_client_id },
    { name = "NOTIFICATION_SERVICE", value = var.notification_service },
    { name = "AWS_SES_FROM_EMAIL", value = var.ses_from_email },
    { name = "AWS_SES_FROM_NAME", value = var.ses_from_name },
    { name = "AWS_S3_BUCKET_NAME", value = module.s3.bucket_name },
    { name = "TENANT_BUCKET_SUFFIX", value = "-sa" },
    { name = "TRYA_ASSETS_BUCKET", value = "broker-tenant-1-hml" },
    { name = "BUCKET_REGION_MAP", value = "{\"grupotrigo-assets-sa\":\"sa-east-1\"}" },
    { name = "ASSETS_CDN_URL", value = "https://hml-app.trya.ai" },
    { name = "DB_HOST", value = var.use_aurora ? module.aurora[0].cluster_endpoint : var.db_host },
    { name = "DB_PORT", value = "5432" },
    { name = "DB_USERNAME", value = var.db_username },
    { name = "DB_PASSWORD", value = var.use_secrets_manager ? "" : var.db_password },
    { name = "DB_NAME", value = var.db_name },
    { name = "DB_SCHEMA", value = var.db_schema },
    { name = "JWT_SECRET", value = var.use_secrets_manager ? "" : var.jwt_secret }
  ]

  secrets = var.use_secrets_manager ? [
    { name = "DB_PASSWORD", valueFrom = var.db_password_secret_arn },
    { name = "JWT_SECRET", valueFrom = var.jwt_secret },
    { name = "COGNITO_CLIENT_SECRET", valueFrom = var.cognito_client_secret_arn }
  ] : []

  tags = local.tags

  depends_on = [module.alb]
}

# Security Group Rule: ECS -> Aurora
resource "aws_security_group_rule" "ecs_to_aurora" {
  count = var.use_aurora ? 1 : 0

  type                     = "egress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = module.aurora[0].security_group_id
  security_group_id        = module.ecs.security_group_id
  description              = "Allow ECS tasks to connect to Aurora"
}

# ==============================================================================
# Aurora PostgreSQL
# ==============================================================================
module "aurora" {
  count  = var.use_aurora ? 1 : 0
  source = "../../modules/aurora"

  cluster_identifier = "${var.project_name}-hml-aurora"
  database_name      = var.db_name
  master_username    = var.db_username
  master_password    = var.db_password

  vpc_id     = data.aws_vpc.main.id
  subnet_ids = data.aws_subnets.private.ids

  # Serverless v2 for cost optimization
  instance_class          = "db.serverless"
  serverless_min_capacity = var.aurora_min_capacity
  serverless_max_capacity = var.aurora_max_capacity

  # Sem readers em HML para economia
  reader_count = var.aurora_reader_count

  # Security
  allowed_security_groups = [module.ecs.security_group_id]
  deletion_protection     = false  # HML pode ser deletado
  skip_final_snapshot     = true

  # Monitoring
  performance_insights_enabled = true
  monitoring_interval          = 60
  create_cloudwatch_alarms     = true

  tags = local.tags
}

# ==============================================================================
# S3 - File Storage
# ==============================================================================
module "s3" {
  source = "../../modules/s3"

  project_name = var.project_name
  environment  = "hml"
  bucket_name  = var.s3_bucket_name

  cors_allowed_origins = concat(split(",", var.cors_origin), [var.frontend_url])

  tags = local.tags
}

# ==============================================================================
# CloudWatch - Monitoring & Alarms
# ==============================================================================
module "cloudwatch" {
  source = "../../modules/cloudwatch"

  dashboard_name   = "${var.project_name}-hml"
  ecs_cluster_name = module.ecs.cluster_name
  ecs_service_name = module.ecs.service_name

  alb_arn_suffix            = regex("app/.*", module.alb.load_balancer_arn)
  aurora_cluster_identifier = var.use_aurora ? module.aurora[0].cluster_identifier : null

  create_alarms    = true
  create_sns_topic = true

  ecs_cpu_threshold           = 80
  ecs_memory_threshold        = 85
  alb_5xx_threshold           = 10
  alb_response_time_threshold = 2

  tags = local.tags
}

# ==============================================================================
# Outputs
# ==============================================================================
output "alb_dns_name" {
  description = "DNS name do ALB"
  value       = module.alb.load_balancer_dns_name
}

output "alb_zone_id" {
  description = "Zone ID do ALB (para Route53)"
  value       = module.alb.zone_id
}

output "ecr_repository_url" {
  description = "URL do repositorio ECR"
  value       = module.ecr.repository_url
}

output "ecs_cluster_name" {
  description = "Nome do cluster ECS"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "Nome do servico ECS"
  value       = module.ecs.service_name
}

# ==============================================================================
# Local Values
# ==============================================================================
locals {
  tags = merge(
    var.tags,
    {
      Environment = "hml"
      Project     = var.project_name
      ManagedBy   = "terraform"
    }
  )
}
