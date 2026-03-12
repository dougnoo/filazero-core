# ==============================================================================
# Network Stack
# ==============================================================================
# Provisions: VPC, Subnets (public/private), Internet Gateway, NAT Gateway,
# Route Tables, and base VPC Endpoints if needed.
#
# This stack is the foundation for all other stacks in the environment.
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
    # terraform init -backend-config=../../environments/dev/network.backend.conf
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
      Stack       = "network"
    }
  }
}

# ==============================================================================
# Locals
# ==============================================================================
locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Stack       = "network"
    },
    var.additional_tags
  )
}

# ==============================================================================
# Network Module
# ==============================================================================
module "network" {
  source = "../../modules/network"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  enable_nat_gateway = var.enable_nat_gateway
  single_nat_gateway = var.single_nat_gateway

  tags = local.common_tags
}

# ==============================================================================
# Route53 Hosted Zone (data source - already exists)
# ==============================================================================
data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false
}
