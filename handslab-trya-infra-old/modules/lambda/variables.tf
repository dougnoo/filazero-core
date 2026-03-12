# ==============================================================================
# Lambda Module Variables
# ==============================================================================

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "function_name" {
  description = "Name of the Lambda function"
  type        = string
}

variable "description" {
  description = "Description of the Lambda function"
  type        = string
  default     = ""
}

# Package configuration
variable "package_type" {
  description = "Package type (Zip or Image)"
  type        = string
  default     = "Zip"
}

variable "filename" {
  description = "Path to the ZIP file (for Zip package type)"
  type        = string
  default     = null
}

variable "s3_bucket" {
  description = "S3 bucket containing the deployment package"
  type        = string
  default     = null
}

variable "s3_key" {
  description = "S3 key of the deployment package"
  type        = string
  default     = null
}

variable "source_code_hash" {
  description = "Source code hash (for Zip package type without filename)"
  type        = string
  default     = null
}

variable "handler" {
  description = "Function handler (for Zip package type)"
  type        = string
  default     = "index.handler"
}

variable "runtime" {
  description = "Runtime (for Zip package type)"
  type        = string
  default     = "python3.11"
}

variable "image_uri" {
  description = "ECR image URI (for Image package type)"
  type        = string
  default     = null
}

# Configuration
variable "timeout" {
  description = "Function timeout in seconds"
  type        = number
  default     = 30
}

variable "memory_size" {
  description = "Memory size in MB"
  type        = number
  default     = 128
}

variable "ephemeral_storage_size" {
  description = "Ephemeral storage size in MB"
  type        = number
  default     = 512
}

variable "reserved_concurrent_executions" {
  description = "Reserved concurrent executions (-1 for unreserved)"
  type        = number
  default     = -1
}

# VPC configuration
variable "vpc_id" {
  description = "VPC ID (null for no VPC)"
  type        = string
  default     = null
}

variable "subnet_ids" {
  description = "List of subnet IDs"
  type        = list(string)
  default     = []
}

variable "security_group_ids" {
  description = "List of security group IDs"
  type        = list(string)
  default     = []
}

# Environment
variable "environment_variables" {
  description = "Environment variables for the function"
  type        = map(string)
  default     = {}
}

# IAM
variable "additional_policies" {
  description = "Additional IAM policies for the Lambda role"
  type = list(object({
    name   = string
    policy = string
  }))
  default = []
}

# Logging
variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 14
}

# X-Ray
variable "enable_xray" {
  description = "Enable X-Ray tracing"
  type        = bool
  default     = false
}

# Function URL
variable "create_function_url" {
  description = "Create a function URL"
  type        = bool
  default     = false
}

variable "function_url_auth_type" {
  description = "Function URL authorization type (AWS_IAM or NONE)"
  type        = string
  default     = "NONE"
}

variable "function_url_cors" {
  description = "CORS configuration for function URL"
  type        = map(any)
  default     = null
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
