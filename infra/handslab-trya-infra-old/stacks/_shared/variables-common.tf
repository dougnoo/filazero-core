# Common variables shared across all stacks

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

variable "domain_name" {
  description = "Root domain name"
  type        = string
  default     = "trya.com.br"
}

variable "additional_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# Locals for common configurations
locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    },
    var.additional_tags
  )

  # Environment-specific subdomains
  # dev: dev.trya.com.br, api-dev.trya.com.br, etc.
  # hml: hml.trya.com.br, api-hml.trya.com.br, etc.
  # prod: trya.com.br, api.trya.com.br, etc.
  frontend_subdomain = var.environment == "prod" ? "" : var.environment
  backend_subdomain  = var.environment == "prod" ? "api" : "api-${var.environment}"
  chat_subdomain     = var.environment == "prod" ? "chat" : "chat-${var.environment}"
  platform_subdomain = var.environment == "prod" ? "platform" : "platform-${var.environment}"

  frontend_domain = var.environment == "prod" ? var.domain_name : "${var.environment}.${var.domain_name}"
  backend_domain  = "${local.backend_subdomain}.${var.domain_name}"
  chat_domain     = "${local.chat_subdomain}.${var.domain_name}"
  platform_domain = "${local.platform_subdomain}.${var.domain_name}"
}
