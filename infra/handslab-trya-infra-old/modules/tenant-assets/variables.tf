variable "tenant_name" {
  description = "Name of the tenant (e.g., trya, grupotrigo)"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.tenant_name))
    error_message = "Tenant name must be lowercase alphanumeric with hyphens only."
  }
}

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

variable "enable_versioning" {
  description = "Enable versioning on the bucket"
  type        = bool
  default     = true
}

variable "enable_public_read" {
  description = "Enable public read access for assets (logos, images)"
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

variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}

# =============================================================================
# IAM Configuration
# =============================================================================

variable "ecs_task_role_arns" {
  description = "List of ECS task role ARNs that need access to this bucket"
  type        = list(string)
  default     = []
}

variable "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN for OAC access (optional)"
  type        = string
  default     = ""
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
