# ─── FilaZero Production Common Variables ──────────────────
environment  = "production"
project_name = "filazero"
aws_region   = "sa-east-1"

# VPC
vpc_cidr             = "10.0.0.0/16"
availability_zones   = ["sa-east-1a", "sa-east-1b", "sa-east-1c"]
private_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
public_subnet_cidrs  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

# ECS
api_cpu    = 1024
api_memory = 2048
api_desired_count = 2
api_min_count     = 2
api_max_count     = 10

# RDS Aurora
db_instance_class      = "db.r6g.large"
db_min_capacity        = 0.5
db_max_capacity        = 8
db_deletion_protection = true

# DynamoDB (Tenant API)
dynamodb_billing_mode = "PAY_PER_REQUEST"

# Cognito
cognito_password_min_length = 8
cognito_mfa_enabled         = true

# Domain
domain_name = "filazerosaude.com.br"
