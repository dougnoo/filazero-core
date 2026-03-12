terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend S3 comentado - usando backend local por enquanto
  # Para usar S3, descomente e configure:
  # backend "s3" {
  #   bucket = "trya-frontend-terraform-state"
  #   key    = "dev/terraform.tfstate"
  #   region = "sa-east-1"
  #   encrypt = true
  #   dynamodb_table = "trya-frontend-terraform-locks"
  # }
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

