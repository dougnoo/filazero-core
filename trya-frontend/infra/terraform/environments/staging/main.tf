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

# Módulo ECR
module "ecr" {
  source = "../../modules/ecr"

  repository_name      = "${var.project_name}-${var.environment}"
  image_tag_mutability = "MUTABLE"
  scan_on_push         = true
  max_image_count      = 10

  tags = local.tags
}

# Módulo ALB
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

  tags = local.tags
}

# Security Group Rule: Allow ALB to ECS
resource "aws_security_group_rule" "alb_to_ecs" {
  type                     = "egress"
  from_port                = 3000
  to_port                  = 3000
  protocol                 = "tcp"
  source_security_group_id = module.alb.security_group_id
  security_group_id        = module.ecs.security_group_id
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

# Módulo ECS
module "ecs" {
  source = "../../modules/ecs"

  cluster_name = "${var.project_name}-${var.environment}-cluster"
  service_name = "${var.project_name}-${var.environment}-service"
  vpc_id       = data.aws_vpc.main.id
  subnet_ids   = data.aws_subnets.private.ids

  container_image = "${module.ecr.repository_url}:latest"
  container_name  = "trya-frontend"
  container_port  = 3000

  target_group_arn = module.alb.target_group_arn

  task_cpu    = var.task_cpu
  task_memory = var.task_memory

  desired_count    = var.desired_count
  assign_public_ip = false

  environment_variables = [
    {
      name  = "NODE_ENV"
      value = var.environment
    },
    {
      name  = "PORT"
      value = "3000"
    },
    {
      name  = "NEXT_PUBLIC_API_BASE_URL"
      value = var.next_public_api_url
    }
  ]

  tags = local.tags

  depends_on = [
    module.alb
  ]
}

# Módulo CloudFront
module "cloudfront" {
  source = "../../modules/cloudfront"

  name               = "${var.project_name}-${var.environment}"
  origin_domain_name = module.alb.load_balancer_dns_name
  comment            = "CloudFront distribution for ${var.project_name} ${var.environment}"
  default_root_object = "login"

  aliases     = var.cloudfront_aliases
  enable_ipv6 = true

  static_cache_behaviors = [
    {
      path_pattern           = "/_next/static/*"
      allowed_methods        = ["GET", "HEAD"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      viewer_protocol_policy = "redirect-to-https"
    },
    {
      path_pattern           = "/static/*"
      allowed_methods        = ["GET", "HEAD"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      viewer_protocol_policy = "redirect-to-https"
    }
  ]

  use_default_certificate = var.cloudfront_use_default_certificate
  acm_certificate_arn     = var.cloudfront_acm_certificate_arn

  tags = local.tags

  depends_on = [
    module.alb
  ]
}

# Local values
locals {
  tags = merge(
    var.tags,
    {
      Environment = var.environment
      Project     = var.project_name
    }
  )
}

