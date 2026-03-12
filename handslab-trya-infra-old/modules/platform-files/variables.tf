# =============================================================================
# Platform Files Bucket Variables
# =============================================================================
# Bucket para arquivos gerados pela plataforma (fotos de perfil, uploads, etc.)

variable "environment" {
  description = "Environment name (dev, hml, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "hml", "prod"], var.environment)
    error_message = "Environment must be one of: dev, hml, prod."
  }
}

variable "region" {
  description = "AWS region for the bucket"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Name of the S3 bucket (defaults to trya-platform-files)"
  type        = string
  default     = "trya-platform-files"
}

variable "enable_versioning" {
  description = "Enable versioning on the bucket"
  type        = bool
  default     = true
}

variable "cors_allowed_origins" {
  description = "Allowed origins for CORS"
  type        = list(string)
  default     = ["https://*.trya.ai", "http://localhost:3000"]
}

variable "lifecycle_noncurrent_days" {
  description = "Days to keep noncurrent versions before deletion"
  type        = number
  default     = 30
}

variable "public_read_prefixes" {
  description = "List of S3 key prefixes that should have public read access"
  type        = list(string)
  default     = ["profile-pictures/"]
}

variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}

# =============================================================================
# IAM Configuration
# =============================================================================

variable "ecs_task_role_arns" {
  description = "List of ECS task role ARNs that need full access to this bucket"
  type        = list(string)
  default     = []
}

variable "create_iam_policy" {
  description = "Create an IAM policy for bucket access that can be attached to roles"
  type        = bool
  default     = true
}

variable "attach_policy_to_roles" {
  description = "List of IAM role names to attach the bucket access policy to"
  type        = list(string)
  default     = []
}
