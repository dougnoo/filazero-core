variable "function_name" {
  description = "Name of the Lambda function"
  type        = string
}

variable "description" {
  description = "Description of the Lambda function"
  type        = string
  default     = ""
}

variable "filename" {
  description = "Path to the Lambda deployment package"
  type        = string
}

variable "source_code_hash" {
  description = "Base64-encoded SHA256 hash of the package file"
  type        = string
  default     = null
}

variable "handler" {
  description = "Function entrypoint"
  type        = string
}

variable "runtime" {
  description = "Runtime environment"
  type        = string
  default     = "python3.11"
}

variable "timeout" {
  description = "Function timeout in seconds"
  type        = number
  default     = 300
}

variable "memory_size" {
  description = "Memory size in MB"
  type        = number
  default     = 1024
}

variable "ephemeral_storage_size" {
  description = "Ephemeral storage size in MB"
  type        = number
  default     = 512
}

variable "vpc_config" {
  description = "VPC configuration"
  type = object({
    subnet_ids         = list(string)
    security_group_ids = list(string)
  })
  default = null
}

variable "environment_variables" {
  description = "Environment variables"
  type        = map(string)
  default     = {}
}

variable "enable_xray" {
  description = "Enable AWS X-Ray tracing"
  type        = bool
  default     = false
}

variable "reserved_concurrent_executions" {
  description = "Reserved concurrent executions"
  type        = number
  default     = -1
}

variable "log_retention_days" {
  description = "CloudWatch Logs retention in days"
  type        = number
  default     = 365
}

variable "kms_key_id" {
  description = "KMS key ID for CloudWatch Logs and environment variables encryption"
  type        = string
  default     = null
}

variable "dead_letter_target_arn" {
  description = "ARN of SQS queue or SNS topic for dead letter queue"
  type        = string
  default     = null
}

variable "custom_policy" {
  description = "Custom IAM policy JSON"
  type        = string
  default     = null
}

# =============================================================================
# Service-specific IAM Policies
# =============================================================================

variable "enable_bedrock" {
  description = "Enable Bedrock permissions (InvokeModel, Knowledge Base)"
  type        = bool
  default     = false
}

variable "enable_dynamodb" {
  description = "Enable DynamoDB permissions"
  type        = bool
  default     = false
}

variable "dynamodb_table_arns" {
  description = "List of DynamoDB table ARNs (if null, allows all)"
  type        = list(string)
  default     = null
}

variable "enable_s3" {
  description = "Enable S3 permissions"
  type        = bool
  default     = false
}

variable "s3_bucket_arns" {
  description = "List of S3 bucket ARNs (if null, allows all)"
  type        = list(string)
  default     = null
}

variable "enable_transcribe" {
  description = "Enable Transcribe permissions"
  type        = bool
  default     = false
}

variable "enable_elasticache" {
  description = "Enable ElastiCache permissions"
  type        = bool
  default     = false
}

variable "enable_function_url" {
  description = "Enable Lambda Function URL"
  type        = bool
  default     = false
}

variable "function_url_auth_type" {
  description = "Function URL authorization type (NONE or AWS_IAM)"
  type        = string
  default     = "AWS_IAM"
}

variable "function_url_cors" {
  description = "CORS configuration for Function URL"
  type = object({
    allow_credentials = bool
    allow_origins     = list(string)
    allow_methods     = list(string)
    allow_headers     = list(string)
    expose_headers    = list(string)
    max_age           = number
  })
  default = null
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
