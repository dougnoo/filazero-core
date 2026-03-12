terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend S3 - CONTA HML
  # Inicialize com: terraform init -backend-config=backend-hml.conf
  backend "s3" {
    # Valores serão fornecidos via backend-hml.conf
    # bucket         = "trya-terraform-state-hml"
    # key            = "frontend/staging/terraform.tfstate"
    # region         = "sa-east-1"
    # encrypt        = true
    # dynamodb_table = "trya-terraform-locks-hml"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "trya-frontend"
      ManagedBy   = "terraform"
    }
  }
}

# Provider para ACM em us-east-1 (obrigatorio para CloudFront)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "trya-frontend"
      ManagedBy   = "terraform"
    }
  }
}
