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

  repository_name      = "${var.project_name}-${var.environment}"
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

  name       = "${var.project_name}-${var.environment}-alb"
  vpc_id     = data.aws_vpc.main.id
  subnet_ids = data.aws_subnets.public.ids
  internal   = false

  enable_https          = var.enable_https
  enable_https_redirect = var.enable_https_redirect
  certificate_arn       = var.certificate_arn

  target_group_port = 3000
  health_check_path = "/api/health"

  # Rate limiting through stickiness
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

  name        = "${var.project_name}-${var.environment}-waf"
  description = "WAF for ${var.project_name} API - ${var.environment}"
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

  cluster_name = "${var.project_name}-${var.environment}-cluster"
  service_name = "${var.project_name}-${var.environment}-service"
  vpc_id       = data.aws_vpc.main.id
  subnet_ids   = data.aws_subnets.private.ids

  container_image = "${module.ecr.repository_url}:latest"
  container_name  = "trya-backend"
  container_port  = 3000

  target_group_arn = module.alb.target_group_arn

  task_cpu    = var.task_cpu
  task_memory = var.task_memory

  desired_count    = var.desired_count
  assign_public_ip = false

  # Cognito User Pool ARN for IAM permissions
  cognito_user_pool_arn = "arn:aws:cognito-idp:${var.aws_region}:${data.aws_caller_identity.current.account_id}:userpool/${var.cognito_user_pool_id}"

  # Auto Scaling
  enable_autoscaling       = var.enable_autoscaling
  autoscaling_min_capacity = var.autoscaling_min_capacity
  autoscaling_max_capacity = var.autoscaling_max_capacity
  autoscaling_cpu_target   = 70
  autoscaling_memory_target = 80

  # Container Insights & Logging
  enable_container_insights = true
  log_retention_days        = 30

  # Deployment
  deployment_circuit_breaker_enable   = true
  deployment_circuit_breaker_rollback = true
  enable_execute_command              = var.environment != "production"

  # Fargate Spot for cost savings in dev
  enable_fargate_spot = var.environment == "dev"
  fargate_weight      = 1
  fargate_spot_weight = var.environment == "dev" ? 2 : 0

  environment_variables = [
    { name = "NODE_ENV", value = var.environment == "dev" ? "development" : var.environment },
    { name = "PORT", value = "3000" },
    { name = "CORS_ORIGIN", value = var.cors_origin },
    { name = "JWT_EXPIRES_IN", value = var.jwt_expires_in },
    { name = "AWS_REGION", value = var.aws_region },
    { name = "COGNITO_USER_POOL_ID", value = var.cognito_user_pool_id },
    { name = "COGNITO_CLIENT_ID", value = var.cognito_client_id },
    { name = "COGNITO_REGION", value = var.cognito_region },
    { name = "COGNITO_DOMAIN", value = var.cognito_domain },
    { name = "COGNITO_REDIRECT_URI", value = var.cognito_redirect_uri },
    { name = "DYNAMODB_OTP_TABLE_NAME", value = var.dynamodb_otp_table_name },
    { name = "OTP_STORAGE", value = "dynamodb" },
    { name = "NOTIFICATION_SERVICE", value = var.notification_service },
    { name = "SES_FROM_EMAIL", value = var.ses_from_email },
    { name = "SES_FROM_NAME", value = var.ses_from_name },
    { name = "S3_BUCKET_NAME", value = var.s3_bucket_name },
    { name = "S3_BUCKET_REGION", value = var.s3_bucket_region },
    { name = "BEDROCK_MODEL_ID", value = var.bedrock_model_id },
    { name = "BEDROCK_REGION", value = var.bedrock_region },
    { name = "POSTGRES_HOST", value = var.use_aurora ? module.aurora[0].cluster_endpoint : var.postgres_host },
    { name = "POSTGRES_PORT", value = "5432" },
    { name = "POSTGRES_USER", value = var.postgres_user },
    { name = "POSTGRES_DB", value = var.postgres_db },
    { name = "DATABASE_URL", value = var.use_aurora ? "postgresql://${var.postgres_user}:${var.postgres_password}@${module.aurora[0].cluster_endpoint}:5432/${var.postgres_db}" : var.database_url }
  ]

  secrets = var.use_secrets_manager ? [
    { name = "POSTGRES_PASSWORD", valueFrom = var.postgres_password_secret_arn },
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

# Security Group Rule: ElastiCache <- ECS (Valkey/Redis 6379)
resource "aws_security_group_rule" "elasticache_from_ecs" {
  count = var.elasticache_security_group_id != "" ? 1 : 0

  type                     = "ingress"
  from_port                = var.elasticache_port
  to_port                  = var.elasticache_port
  protocol                 = "tcp"
  source_security_group_id = module.ecs.security_group_id
  security_group_id        = var.elasticache_security_group_id
  # AWS SG rule description has a restricted charset; keep it simple.
  description = "ECS_to_ElastiCache_6379"
}

# ==============================================================================
# Aurora PostgreSQL (Optional - can use existing RDS)
# ==============================================================================
module "aurora" {
  count  = var.use_aurora ? 1 : 0
  source = "../../modules/aurora"

  cluster_identifier = "${var.project_name}-${var.environment}-aurora"
  database_name      = var.postgres_db
  master_username    = var.postgres_user
  master_password    = var.postgres_password

  vpc_id     = data.aws_vpc.main.id
  subnet_ids = data.aws_subnets.private.ids

  # Serverless v2 for cost optimization
  instance_class          = "db.serverless"
  serverless_min_capacity = var.aurora_min_capacity
  serverless_max_capacity = var.aurora_max_capacity

  # High Availability
  reader_count = var.aurora_reader_count

  # Security
  allowed_security_groups = [module.ecs.security_group_id]
  deletion_protection     = var.environment == "production"
  skip_final_snapshot     = var.environment != "production"

  # Monitoring
  performance_insights_enabled = true
  monitoring_interval          = 60
  create_cloudwatch_alarms     = true

  tags = local.tags
}

# ==============================================================================
# CloudWatch - Monitoring & Alarms
# ==============================================================================
module "cloudwatch" {
  source = "../../modules/cloudwatch"

  dashboard_name   = "${var.project_name}-${var.environment}"
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
# Local Values
# ==============================================================================
locals {
  tags = merge(
    var.tags,
    {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
    }
  )
}

