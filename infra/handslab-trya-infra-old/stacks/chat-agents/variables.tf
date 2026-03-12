# ==============================================================================
# Chat Agents Stack Variables
# ==============================================================================

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "Trya"
}

variable "environment" {
  description = "Environment name (dev, hml, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "hml", "prod"], var.environment)
    error_message = "Environment must be dev, hml, or prod."
  }
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "sa-east-1"
}

variable "state_bucket" {
  description = "S3 bucket for Terraform state"
  type        = string
  default     = "trya-terraform-state"
}

variable "additional_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# Bedrock configuration
variable "bedrock_model_id" {
  description = "ID of the Bedrock model to use"
  type        = string
  default     = "anthropic.claude-3-5-sonnet-20240620-v1:0"
}

variable "knowledge_base_id" {
  description = "ID of the Bedrock Knowledge Base (optional)"
  type        = string
  default     = "OAZCZQWBQY"
}

# API configuration
variable "trya_api_platform_url" {
  description = "URL of the Trya Platform API"
  type        = string
  default     = ""
}

variable "trya_api_platform_key" {
  description = "API key for the Trya Platform API"
  type        = string
  default     = ""
  sensitive   = true
}

variable "tenant_api_url" {
  description = "URL of the Tenant API"
  type        = string
  default     = ""
}

variable "tenant_api_key" {
  description = "API key for the Tenant API"
  type        = string
  default     = ""
  sensitive   = true
}

variable "aws_profile" {
  description = "AWS CLI profile to use"
  type        = string
  default     = "skopia"
}
