# ==============================================================================
# Trya Platform Backend - Terraform Variables (DEV)
# Account ID: 416684166863
# ==============================================================================

# ==============================================================================
# General Configuration
# ==============================================================================
aws_region   = "us-east-1"
environment  = "dev"
project_name = "trya-platform-backend"

# ==============================================================================
# Networking - Existing VPC and Subnets
# ==============================================================================
vpc_id = "vpc-05550ca68ba305afb"

public_subnet_ids = [
  "subnet-086fc061e53c37c3a",  # us-east-1a
  "subnet-0e24669b3bdad590a",  # us-east-1b
  "subnet-0bee6b992a1e42a6b"   # us-east-1c
]

private_subnet_ids = [
  "subnet-086fc061e53c37c3a",  # us-east-1a
  "subnet-0e24669b3bdad590a",  # us-east-1b
  "subnet-0bee6b992a1e42a6b"   # us-east-1c
]

# ==============================================================================
# ALB Configuration
# ==============================================================================
enable_https          = false
enable_https_redirect = false
certificate_arn       = null

# ==============================================================================
# WAF Configuration
# ==============================================================================
waf_rate_limit = 2000

# ==============================================================================
# ECS Configuration
# ==============================================================================
task_cpu    = 512
task_memory = 1024

desired_count            = 1
enable_autoscaling       = true
autoscaling_min_capacity = 1
autoscaling_max_capacity = 4

# ==============================================================================
# Aurora Configuration (usando Aurora existente do trya-backend)
# ==============================================================================
use_aurora          = false
aurora_min_capacity = 0.5
aurora_max_capacity = 4
aurora_reader_count = 1

# ==============================================================================
# Database Configuration (Aurora existente)
# ==============================================================================
db_username = "postgres"
db_password = "TryaDB2024!Secure"
db_name     = "trya"
db_schema   = "platform_dev"
db_host     = "trya-backend-dev-aurora.cluster-c0l4y2syc0wl.us-east-1.rds.amazonaws.com"

use_secrets_manager    = false
db_password_secret_arn = ""

# ==============================================================================
# Application Configuration
# ==============================================================================
cors_origin          = "http://localhost:3000,https://d2frhe3dioiltz.cloudfront.net,https://dev-app.trya.ai"
frontend_url         = "https://dev-app.trya.ai"
jwt_secret           = "IlVjvtNyncvdfNiG7Fkoa8GNr4xx2yFgW1BnOuVZeW0="
jwt_expiration       = "3600"
notification_service = "ses"

# ==============================================================================
# AWS Cognito
# ==============================================================================
cognito_user_pool_id      = "us-east-1_Brw5t4pXW"
cognito_client_id         = "5glp5r6o91vdmusvaa4quued58"
cognito_client_secret     = ""
cognito_client_secret_arn = ""

# ==============================================================================
# AWS S3
# ==============================================================================
s3_bucket_name = "trya-platform-assets-dev"

# ==============================================================================
# AWS SES
# ==============================================================================
ses_from_email = "gustavoborges@skopiadigital.com.br"
ses_from_name  = "Trya Health"

# ==============================================================================
# Tags
# ==============================================================================
tags = {
  Team        = "Platform"
  CostCenter  = "Engineering"
  Application = "Trya Platform"
}
