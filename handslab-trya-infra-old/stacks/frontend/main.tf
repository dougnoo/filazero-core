# ==============================================================================
# Frontend Stack
# ==============================================================================
# Provisions: ECR, ECS Service, ALB, CloudFront (optional), Route53 record
# for the frontend application (Next.js).
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
    # terraform init -backend-config=../../environments/dev/frontend.backend.conf
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Stack       = "frontend"
    }
  }
}

# Provider for ACM certificates in us-east-1 (required for CloudFront)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Stack       = "frontend"
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

  # Frontend domain based on environment
  # dev: dev.trya.com.br
  # hml: hml.trya.com.br
  # prod: trya.com.br (or www.trya.com.br)
  frontend_subdomain = var.environment == "prod" ? "" : var.environment
  frontend_domain    = var.environment == "prod" ? var.domain_name : "${var.environment}.${var.domain_name}"

  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Stack       = "frontend"
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
      name         = "frontend"
      scan_on_push = true
    }
  ]

  tags = local.common_tags
}

# ==============================================================================
# Security Group for ECS Tasks
# ==============================================================================
resource "aws_security_group" "ecs_tasks" {
  name_prefix = "${local.name_prefix}-frontend-ecs-"
  description = "Security group for frontend ECS tasks"
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
      Name = "${local.name_prefix}-frontend-ecs-sg"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
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

  container_image = var.container_image != "" ? var.container_image : "${module.ecr.repository_urls["frontend"]}:latest"
  container_port  = var.container_port
  cpu             = var.cpu
  memory          = var.memory

  desired_count = var.desired_count
  min_capacity  = var.min_capacity
  max_capacity  = var.max_capacity

  health_check_path = var.health_check_path

  environment_variables = merge(
    {
      NODE_ENV = var.environment == "dev" ? "development" : var.environment
      PORT     = tostring(var.container_port)
    },
    var.environment_variables
  )

  secrets = var.secrets

  tags = local.common_tags
}

# ==============================================================================
# Route53 Record
# ==============================================================================
resource "aws_route53_record" "frontend" {
  zone_id = local.route53_zone_id
  name    = local.frontend_domain
  type    = "A"

  alias {
    name                   = module.ecs_service.alb_dns_name
    zone_id                = module.ecs_service.alb_zone_id
    evaluate_target_health = true
  }
}
