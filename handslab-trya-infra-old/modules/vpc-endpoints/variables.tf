# ==============================================================================
# VPC Endpoints Module Variables
# ==============================================================================

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for interface endpoints"
  type        = list(string)
}

variable "security_group_ids" {
  description = "List of security group IDs for interface endpoints"
  type        = list(string)
}

variable "route_table_ids" {
  description = "List of route table IDs for gateway endpoints"
  type        = list(string)
  default     = []
}

# Gateway Endpoints (Free)
variable "create_s3_endpoint" {
  description = "Create S3 Gateway endpoint"
  type        = bool
  default     = false
}

variable "create_dynamodb_endpoint" {
  description = "Create DynamoDB Gateway endpoint"
  type        = bool
  default     = false
}

# Interface Endpoints
variable "create_bedrock_runtime_endpoint" {
  description = "Create Bedrock Runtime interface endpoint"
  type        = bool
  default     = false
}

variable "create_bedrock_agent_runtime_endpoint" {
  description = "Create Bedrock Agent Runtime interface endpoint"
  type        = bool
  default     = false
}

variable "create_transcribe_endpoint" {
  description = "Create Transcribe interface endpoint"
  type        = bool
  default     = false
}

variable "create_secrets_manager_endpoint" {
  description = "Create Secrets Manager interface endpoint"
  type        = bool
  default     = false
}

variable "create_ecr_endpoints" {
  description = "Create ECR API and DKR interface endpoints"
  type        = bool
  default     = false
}

variable "create_logs_endpoint" {
  description = "Create CloudWatch Logs interface endpoint"
  type        = bool
  default     = false
}

variable "create_sts_endpoint" {
  description = "Create STS interface endpoint"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
