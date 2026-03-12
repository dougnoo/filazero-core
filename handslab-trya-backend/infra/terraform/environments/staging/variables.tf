# ==============================================================================
# General
# ==============================================================================
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "sa-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "staging"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "trya-backend"
}

# ==============================================================================
# Networking
# ==============================================================================
variable "vpc_id" {
  description = "VPC ID where resources will be created"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for ALB"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for ECS tasks and Aurora"
  type        = list(string)
}

# ==============================================================================
# ElastiCache (Serverless Valkey/Redis) - Networking
# ==============================================================================
variable "elasticache_security_group_id" {
  description = "Security Group ID attached to the ElastiCache (Serverless) cache"
  type        = string
  default     = ""
}

variable "elasticache_host" {
  description = "ElastiCache endpoint hostname"
  type        = string
  default     = ""
}

variable "elasticache_port" {
  description = "ElastiCache port (6379 for Valkey/Redis)"
  type        = number
  default     = 6379
}

variable "elasticache_tls" {
  description = "Enable TLS for ElastiCache connection"
  type        = string
  default     = "true"
}

# ==============================================================================
# ALB Configuration
# ==============================================================================
variable "enable_https" {
  description = "Enable HTTPS on ALB"
  type        = bool
  default     = true
}

variable "enable_https_redirect" {
  description = "Enable HTTP to HTTPS redirect on ALB"
  type        = bool
  default     = true
}

variable "certificate_arn" {
  description = "ARN of the SSL certificate for ALB HTTPS listener"
  type        = string
  default     = null
}

# ==============================================================================
# WAF Configuration
# ==============================================================================
variable "waf_rate_limit" {
  description = "WAF rate limit per 5 minute period per IP"
  type        = number
  default     = 2000
}

# ==============================================================================
# ECS Configuration
# ==============================================================================
variable "task_cpu" {
  description = "CPU units for ECS task"
  type        = number
  default     = 512
}

variable "task_memory" {
  description = "Memory in MB for ECS task"
  type        = number
  default     = 1024
}

variable "desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 2
}

variable "enable_autoscaling" {
  description = "Enable ECS auto scaling"
  type        = bool
  default     = true
}

variable "autoscaling_min_capacity" {
  description = "Minimum number of ECS tasks"
  type        = number
  default     = 1
}

variable "autoscaling_max_capacity" {
  description = "Maximum number of ECS tasks"
  type        = number
  default     = 4
}

# ==============================================================================
# Aurora Configuration
# ==============================================================================
variable "use_aurora" {
  description = "Use Aurora PostgreSQL"
  type        = bool
  default     = true
}

variable "aurora_min_capacity" {
  description = "Aurora Serverless v2 minimum ACU"
  type        = number
  default     = 0.5
}

variable "aurora_max_capacity" {
  description = "Aurora Serverless v2 maximum ACU"
  type        = number
  default     = 4
}

variable "aurora_reader_count" {
  description = "Number of Aurora reader instances"
  type        = number
  default     = 0
}

# ==============================================================================
# Database Configuration
# ==============================================================================
variable "postgres_host" {
  description = "PostgreSQL host"
  type        = string
  default     = ""
}

variable "postgres_user" {
  description = "PostgreSQL username"
  type        = string
  default     = "postgres"
}

variable "postgres_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
}

variable "postgres_db" {
  description = "PostgreSQL database name"
  type        = string
  default     = "trya"
}

variable "database_url" {
  description = "Full database URL"
  type        = string
  default     = ""
}

variable "use_secrets_manager" {
  description = "Use AWS Secrets Manager for sensitive values"
  type        = bool
  default     = true
}

variable "postgres_password_secret_arn" {
  description = "ARN of the Secrets Manager secret for PostgreSQL password"
  type        = string
  default     = ""
}

# ==============================================================================
# Application Configuration
# ==============================================================================
variable "cors_origin" {
  description = "CORS origin for the API"
  type        = string
  default     = "https://hml.trya.com.br"
}

variable "jwt_expires_in" {
  description = "JWT expiration time"
  type        = string
  default     = "7d"
}

# ==============================================================================
# AWS Cognito
# ==============================================================================
variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  type        = string
}

variable "cognito_client_id" {
  description = "Cognito Client ID"
  type        = string
}

variable "cognito_client_secret_arn" {
  description = "ARN of the Secrets Manager secret for Cognito Client Secret"
  type        = string
  default     = ""
}

variable "cognito_region" {
  description = "Cognito region"
  type        = string
  default     = "sa-east-1"
}

variable "cognito_domain" {
  description = "Cognito domain"
  type        = string
}

variable "cognito_redirect_uri" {
  description = "Cognito redirect URI"
  type        = string
  default     = "https://hml.trya.com.br/auth/callback"
}

# ==============================================================================
# AWS Services
# ==============================================================================
variable "dynamodb_otp_table_name" {
  description = "DynamoDB table name for OTP"
  type        = string
  default     = "trya-otp-hml"
}

variable "notification_service" {
  description = "Notification service"
  type        = string
  default     = "ses"
}

variable "ses_from_email" {
  description = "SES sender email"
  type        = string
  default     = "noreply@trya.com.br"
}

variable "ses_from_name" {
  description = "SES sender name"
  type        = string
  default     = "Trya Health"
}

variable "s3_bucket_name" {
  description = "S3 bucket name"
  type        = string
}

variable "s3_bucket_region" {
  description = "S3 bucket region"
  type        = string
  default     = "sa-east-1"
}

variable "bedrock_model_id" {
  description = "Bedrock model ID"
  type        = string
  default     = "anthropic.claude-3-5-sonnet-20241022-v2:0"
}

variable "bedrock_region" {
  description = "Bedrock region"
  type        = string
  default     = "us-east-1"
}

# ==============================================================================
# Tags
# ==============================================================================
variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}
