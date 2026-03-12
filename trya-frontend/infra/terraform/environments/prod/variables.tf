variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "sa-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "trya-frontend"
}

variable "vpc_id" {
  description = "VPC ID where resources will be created"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for ALB"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for ECS tasks"
  type        = list(string)
}

variable "enable_https" {
  description = "Enable HTTPS on ALB"
  type        = bool
  default     = false
}

variable "enable_https_redirect" {
  description = "Enable HTTP to HTTPS redirect on ALB"
  type        = bool
  default     = false
}

variable "certificate_arn" {
  description = "ARN of the SSL certificate for ALB HTTPS listener"
  type        = string
  default     = null
}

variable "task_cpu" {
  description = "CPU units for ECS task (256 = 0.25 vCPU - free tier)"
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Memory in MB for ECS task (512 MB - free tier)"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1
}

variable "next_public_api_url" {
  description = "Next.js public API URL environment variable"
  type        = string
}

variable "cloudfront_aliases" {
  description = "List of domain aliases for CloudFront"
  type        = list(string)
  default     = []
}

variable "cloudfront_use_default_certificate" {
  description = "Use CloudFront default certificate"
  type        = bool
  default     = false
}

variable "cloudfront_acm_certificate_arn" {
  description = "ACM certificate ARN for CloudFront custom domain"
  type        = string
  default     = null
}

variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}

