# ==============================================================================
# Backend Stack
# ==============================================================================
# Provisions: ECR, ECS Service, ALB, RDS/Aurora, Secrets Manager, Route53 record
# for the main backend API (handslab-trya-backend).
#
# Depends on: network stack (for VPC, subnets)
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    # terraform init -backend-config=../../environments/dev/backend.backend.conf
  }
}

# ==============================================================================
# Import blocks for existing DEV resources
# These can be removed after successful import
# ==============================================================================
# Note: Import blocks don't support variables. Use terraform import CLI instead.
# terraform import 'module.secrets.aws_secretsmanager_secret.main["jwt_secret"]' '/Trya/dev/jwt_secret'
# terraform import 'module.secrets.aws_secretsmanager_secret.main["database_password"]' '/Trya/dev/database_password'


provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Stack       = "backend"
    }
  }
}

# ==============================================================================
# Remote State - Network Stack
# ==============================================================================
data "terraform_remote_state" "network" {
  backend = "s3"

  config = {
    bucket  = var.state_bucket
    key     = "${var.environment}/network/terraform.tfstate"
    region  = "sa-east-1"  # Bucket is always in sa-east-1
    profile = var.aws_profile
  }
}

# ==============================================================================
# Locals
# ==============================================================================
locals {
  name_prefix = "${var.project_name}-${var.environment}"

  # Backend domain based on environment
  # dev: api-dev.trya.com.br
  # hml: api-hml.trya.com.br
  # prod: api.trya.com.br
  backend_subdomain = var.environment == "prod" ? "api" : "api-${var.environment}"
  backend_domain    = "${local.backend_subdomain}.${var.domain_name}"

  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Stack       = "backend"
    },
    var.additional_tags
  )

  # Network outputs
  vpc_id             = data.terraform_remote_state.network.outputs.vpc_id
  public_subnet_ids  = data.terraform_remote_state.network.outputs.public_subnet_ids
  private_subnet_ids = data.terraform_remote_state.network.outputs.private_subnet_ids
  route53_zone_id    = data.terraform_remote_state.network.outputs.route53_zone_id
}

# ==============================================================================
# ECR Repository
# ==============================================================================
module "ecr" {
  source = "../../modules/ecr"

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

# ==============================================================================
# Security Group for ECS Tasks
# ==============================================================================
resource "aws_security_group" "ecs_tasks" {
  name_prefix = "${local.name_prefix}-backend-ecs-"
  description = "Security group for backend ECS tasks"
  vpc_id      = local.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}-backend-ecs-sg"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}

# ==============================================================================
# Secrets Manager
# ==============================================================================
module "secrets" {
  source = "../../modules/secrets"

  project_name = var.project_name
  environment  = var.environment

  secrets = {
    database_password = {
      description = "RDS database master password for backend"
    }
    jwt_secret = {
      description = "JWT secret for authentication"
    }
  }

  parameters = {}

  tags = local.common_tags
}

# ==============================================================================
# RDS PostgreSQL
# ==============================================================================
module "rds" {
  source = "../../modules/rds_postgres"

  project_name        = var.project_name
  environment         = var.environment
  vpc_id              = local.vpc_id
  database_subnet_ids = local.private_subnet_ids

  instance_class    = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  database_name     = var.db_name
  master_username   = var.db_username

  multi_az                = var.db_multi_az
  backup_retention_period = var.db_backup_retention_period
  backup_window           = var.db_backup_window
  maintenance_window      = var.db_maintenance_window

  allowed_security_group_ids = [aws_security_group.ecs_tasks.id]

  tags = local.common_tags
}

# ==============================================================================
# ECS Service
# ==============================================================================
module "ecs_service" {
  source = "../../modules/ecs_service"

  project_name = var.project_name
  environment  = var.environment
  name_suffix  = var.name_suffix

  vpc_id             = local.vpc_id
  private_subnet_ids = local.private_subnet_ids
  public_subnet_ids  = local.public_subnet_ids

  task_security_group_id = aws_security_group.ecs_tasks.id

  container_image = var.container_image != "" ? var.container_image : "${module.ecr.repository_urls["backend"]}:latest"
  container_port  = var.container_port
  cpu             = var.cpu
  memory          = var.memory

  desired_count = var.desired_count
  min_capacity  = var.min_capacity
  max_capacity  = var.max_capacity

  health_check_path = var.health_check_path

  # Enable Lambda invoke for chat agents
  enable_lambda_invoke = true
  lambda_function_arns = [
    "arn:aws:lambda:${var.aws_region}:${data.aws_caller_identity.current.account_id}:function:triagem-saude-agente-${var.environment}"
  ]

  environment_variables = merge(
    {
      NODE_ENV        = var.environment == "dev" ? "development" : var.environment
      PORT            = tostring(var.container_port)
      POSTGRES_HOST   = module.rds.address
      POSTGRES_PORT   = tostring(module.rds.port)
      POSTGRES_DB     = var.db_name
      POSTGRES_USER   = var.db_username
      # Keep old names for compatibility
      DB_HOST         = module.rds.address
      DB_PORT         = tostring(module.rds.port)
      DB_NAME         = var.db_name
      DB_USERNAME     = var.db_username
    },
    var.environment_variables
  )

  secrets = merge(
    {
      POSTGRES_PASSWORD = try(module.secrets.secret_arns["database_password"], "")
      DB_PASSWORD       = try(module.secrets.secret_arns["database_password"], "")
      JWT_SECRET        = try(module.secrets.secret_arns["jwt_secret"], "")
    },
    var.secrets
  )

  tags = local.common_tags

  depends_on = [module.rds, module.secrets]
}

# ==============================================================================
# Data Sources
# ==============================================================================
data "aws_caller_identity" "current" {}

# ==============================================================================
# Route53 Record
# ==============================================================================
resource "aws_route53_record" "backend" {
  zone_id = local.route53_zone_id
  name    = local.backend_domain
  type    = "A"

  alias {
    name                   = module.ecs_service.alb_dns_name
    zone_id                = module.ecs_service.alb_zone_id
    evaluate_target_health = true
  }
}
