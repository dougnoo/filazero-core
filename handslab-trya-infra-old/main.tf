# Locals for common configurations
locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    },
    var.additional_tags
  )

  frontend_domain = var.frontend_subdomain != "" ? "${var.frontend_subdomain}.${var.domain_name}" : var.domain_name
  backend_domain  = "${var.backend_subdomain}.${var.domain_name}"
}

# Data source for Route53 zone (if it already exists)
data "aws_route53_zone" "main" {
  count = var.create_route53_zone ? 0 : 1
  name  = var.domain_name

  depends_on = [module.route53]
}

# ECR Repository for Backend
module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment

  repositories = [
    {
      name         = "backend"
      scan_on_push = true
    }
  ]

  tags = local.common_tags
}

# Network Module
module "network" {
  source = "./modules/network"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  enable_nat_gateway = var.enable_nat_gateway
  single_nat_gateway = var.single_nat_gateway

  tags = local.common_tags
}

# ACM Certificate for CloudFront (must be in us-east-1)
# module "acm_cloudfront" {
#   source = "./modules/acm"

#   domain_name = local.frontend_domain
#   subject_alternative_names = [
#     "*.${var.domain_name}"
#   ]

#   zone_id = var.create_route53_zone ? module.route53[0].zone_id : data.aws_route53_zone.main[0].zone_id

#   tags = local.common_tags
# }

# ACM Certificate for ALB (regional)
# module "acm_alb" {
#   source = "./modules/acm"

#   domain_name               = local.backend_domain
#   subject_alternative_names = []

#   zone_id = var.create_route53_zone ? module.route53[0].zone_id : data.aws_route53_zone.main[0].zone_id

#   tags = local.common_tags
# }

# Route53 Module (optional)
module "route53" {
  count  = var.create_route53_zone ? 1 : 0
  source = "./modules/route53"

  domain_name = var.domain_name

  tags = local.common_tags
}

# Secrets Manager
module "secrets" {
  source = "./modules/secrets"

  project_name = var.project_name
  environment  = var.environment

  secrets = {
    database_password = {
      description = "RDS database master password"
      # Password will be auto-generated
    }
    jwt_secret = {
      description = "JWT secret for authentication"
    }
    api_keys = {
      description = "External API keys"
    }
  }

  parameters = {
    database_url = {
      description = "Database connection URL"
      value       = "" # Will be updated after RDS creation
    }
  }

  tags = local.common_tags
}

# Security Group for ECS Tasks (created separately to break circular dependency)
resource "aws_security_group" "ecs_tasks" {
  name_prefix = "${local.name_prefix}-ecs-tasks-"
  description = "Security group for ECS tasks"
  vpc_id      = module.network.vpc_id

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-ecs-tasks-sg"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}

# RDS PostgreSQL
module "rds" {
  source = "./modules/rds_postgres"

  project_name        = var.project_name
  environment         = var.environment
  vpc_id              = module.network.vpc_id
  database_subnet_ids = module.network.private_subnet_ids

  instance_class         = var.db_instance_class
  allocated_storage      = var.db_allocated_storage
  database_name   = var.db_name
  master_username = var.db_username
  # master_password_secret = module.secrets.secret_arns["database_password"]  # Using AWS managed password

  multi_az                = var.db_multi_az
  backup_retention_period = var.db_backup_retention_period
  backup_window           = var.db_backup_window
  maintenance_window      = var.db_maintenance_window

  allowed_security_group_ids = [aws_security_group.ecs_tasks.id]

  tags = local.common_tags

  depends_on = [module.network, module.secrets]
}

# ECS Service for Backend
module "ecs_service" {
  source = "./modules/ecs_service"

  project_name = var.project_name
  environment  = var.environment

  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
  public_subnet_ids  = module.network.public_subnet_ids

  task_security_group_id = aws_security_group.ecs_tasks.id

  container_image = "nginx:latest" # Placeholder - será substituído pelo CI/CD
  container_port  = var.backend_container_port
  cpu             = var.backend_cpu
  memory          = var.backend_memory

  desired_count = var.backend_desired_count
  min_capacity  = var.backend_min_capacity
  max_capacity  = var.backend_max_capacity

  # certificate_arn = module.acm_alb.certificate_arn  # Removed temporarily

  environment_variables = {
    NODE_ENV    = var.environment
    PORT        = tostring(var.backend_container_port)
    DB_HOST     = module.rds.endpoint
    DB_PORT     = tostring(module.rds.port)
    DB_NAME     = var.db_name
    DB_USERNAME = var.db_username
  }

  secrets = {
    DB_PASSWORD = module.secrets.secret_arns["database_password"]
    JWT_SECRET  = module.secrets.secret_arns["jwt_secret"]
  }

  tags = local.common_tags

  depends_on = [module.network, module.rds, module.ecr]
}

# S3 Bucket for Frontend
module "s3_frontend" {
  source = "./modules/s3_static_site"

  project_name = var.project_name
  environment  = var.environment
  bucket_name  = "${lower(var.project_name)}-${var.environment}-frontend"

  tags = local.common_tags
}

# CloudFront Distribution for Frontend
module "cloudfront" {
  source = "./modules/cloudfront"

  project_name                = var.project_name
  environment                 = var.environment
  bucket_id                   = module.s3_frontend.bucket_id
  bucket_arn                  = module.s3_frontend.bucket_arn
  bucket_regional_domain_name = module.s3_frontend.bucket_regional_domain_name

  # domain_name = local.frontend_domain  # Removed - requires certificate
  # certificate_arn = module.acm_cloudfront.certificate_arn  # Removed temporarily

  tags = local.common_tags
}

# DNS Records
# Frontend A record (commented - no custom domain without certificate)
# resource "aws_route53_record" "frontend" {
#   zone_id = var.create_route53_zone ? module.route53[0].zone_id : data.aws_route53_zone.main[0].zone_id
#   name    = local.frontend_domain
#   type    = "A"

#   alias {
#     name                   = module.cloudfront.distribution_domain_name
#     zone_id                = module.cloudfront.distribution_hosted_zone_id
#     evaluate_target_health = false
#   }
# }

resource "aws_route53_record" "backend" {
  zone_id = var.create_route53_zone ? module.route53[0].zone_id : data.aws_route53_zone.main[0].zone_id
  name    = local.backend_domain
  type    = "A"

  alias {
    name                   = module.ecs_service.alb_dns_name
    zone_id                = module.ecs_service.alb_zone_id
    evaluate_target_health = true
  }
}

# Observability Module
module "observability" {
  count  = var.enable_monitoring ? 1 : 0
  source = "./modules/observability"

  project_name = var.project_name
  environment  = var.environment

  # ECS Metrics
  ecs_cluster_name = module.ecs_service.cluster_name
  ecs_service_name = module.ecs_service.service_name

  # ALB Metrics
  alb_arn_suffix          = module.ecs_service.alb_arn_suffix
  target_group_arn_suffix = module.ecs_service.target_group_arn_suffix

  # RDS Metrics
  rds_instance_id = module.rds.instance_id

  # CloudFront Metrics
  cloudfront_distribution_id = module.cloudfront.distribution_id

  # Alarm configuration
  alarm_email = var.alarm_email

  tags = local.common_tags

  depends_on = [module.ecs_service, module.rds, module.cloudfront]
}
