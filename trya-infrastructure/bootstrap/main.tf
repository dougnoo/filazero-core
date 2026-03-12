# Bootstrap - Criar bucket S3 e DynamoDB para Terraform state
# Rodar UMA VEZ por conta, antes de usar Terragrunt

terraform {
  required_version = ">= 1.5"
}

variable "account_name" {
  description = "Nome da conta (ex: admin-trya-dev)"
  type        = string
}

variable "region" {
  description = "Região AWS"
  type        = string
  default     = "us-east-1"
}

provider "aws" {
  region = var.region
}

# S3 bucket para state
resource "aws_s3_bucket" "tfstate" {
  bucket = "tfstate-${var.account_name}"

  tags = {
    Name      = "Terraform State"
    ManagedBy = "Terraform"
  }
}

resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# DynamoDB para locks
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name      = "Terraform Locks"
    ManagedBy = "Terraform"
  }
}

output "bucket_name" {
  value = aws_s3_bucket.tfstate.id
}

output "dynamodb_table" {
  value = aws_dynamodb_table.terraform_locks.name
}
