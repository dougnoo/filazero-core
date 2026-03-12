# ==============================================================================
# Frontend Stack Variables
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

variable "domain_name" {
  description = "Root domain name"
  type        = string
  default     = "trya.com.br"
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

# Container configuration
variable "container_image" {
  description = "Docker image for the frontend container (leave empty to use ECR)"
  type        = string
  default     = ""
}

variable "container_port" {
  description = "Port exposed by the frontend container"
  type        = number
  default     = 3000
}

variable "cpu" {
  description = "CPU units for frontend container (1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "memory" {
  description = "Memory for frontend container in MB"
  type        = number
  default     = 1024
}

# Scaling configuration
variable "desired_count" {
  description = "Desired number of frontend tasks"
  type        = number
  default     = 1
}

variable "min_capacity" {
  description = "Minimum number of frontend tasks for auto scaling"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum number of frontend tasks for auto scaling"
  type        = number
  default     = 3
}

# Health check
variable "health_check_path" {
  description = "Health check path for the frontend"
  type        = string
  default     = "/api/health"
}

# Environment variables
variable "environment_variables" {
  description = "Environment variables for the frontend container"
  type        = map(string)
  default     = {}
}

# Secrets (from Secrets Manager or SSM)
variable "secrets" {
  description = "Secrets for the frontend container (map of name to ARN)"
  type        = map(string)
  default     = {}
}

variable "aws_profile" {
  description = "AWS CLI profile to use"
  type        = string
  default     = "skopia"
}

variable "name_suffix" {
  description = "Suffix to append to resource names to avoid conflicts"
  type        = string
  default     = ""
}
