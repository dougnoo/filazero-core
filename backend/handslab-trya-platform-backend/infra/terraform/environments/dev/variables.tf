# ==============================================================================
# General
# ==============================================================================
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "trya-platform-backend"
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
  description = "CPU units for ECS task (256, 512, 1024, 2048, 4096)"
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
  default     = 2
}

variable "autoscaling_max_capacity" {
  description = "Maximum number of ECS tasks"
  type        = number
  default     = 10
}

# ==============================================================================
# Aurora Configuration
# ==============================================================================
variable "use_aurora" {
  description = "Use Aurora PostgreSQL (false to use existing RDS)"
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
  default     = 1
}

# ==============================================================================
# Database Configuration
# ==============================================================================
variable "db_host" {
  description = "Database host (used if not using Aurora)"
  type        = string
  default     = ""
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "trya_platform"
}

variable "db_schema" {
  description = "Database schema"
  type        = string
  default     = "public"
}

variable "use_secrets_manager" {
  description = "Use AWS Secrets Manager for sensitive values"
  type        = bool
  default     = false
}

variable "db_password_secret_arn" {
  description = "ARN of the Secrets Manager secret for database password"
  type        = string
  default     = ""
}

# ==============================================================================
# Application Configuration
# ==============================================================================
variable "cors_origin" {
  description = "CORS origin for the API"
  type        = string
  default     = "http://localhost:3000"
}

variable "frontend_url" {
  description = "Frontend URL for redirects"
  type        = string
  default     = "http://localhost:3000/login"
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "jwt_expiration" {
  description = "JWT expiration time in seconds"
  type        = string
  default     = "3600"
}

variable "notification_service" {
  description = "Notification service (console or ses)"
  type        = string
  default     = "ses"
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

variable "cognito_client_secret" {
  description = "Cognito Client Secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "cognito_client_secret_arn" {
  description = "ARN of the Secrets Manager secret for Cognito Client Secret"
  type        = string
  default     = ""
}

# ==============================================================================
# AWS S3
# ==============================================================================
variable "s3_bucket_name" {
  description = "S3 bucket name for assets storage"
  type        = string
  default     = "trya-platform-assets"
}

# ==============================================================================
# AWS SES
# ==============================================================================
variable "ses_from_email" {
  description = "SES sender email"
  type        = string
  default     = "noreply@trya.health"
}

variable "ses_from_name" {
  description = "SES sender name"
  type        = string
  default     = "HandsLab"
}

# ==============================================================================
# Tags
# ==============================================================================
variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}
