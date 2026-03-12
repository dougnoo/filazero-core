# General Variables
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

# Network Variables
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["sa-east-1a", "sa-east-1b", "sa-east-1c"]
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets"
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Use a single NAT Gateway for all private subnets (cost optimization)"
  type        = bool
  default     = true
}

# Domain Variables
variable "domain_name" {
  description = "Root domain name"
  type        = string
  default     = "trya.com.br"
}

variable "create_route53_zone" {
  description = "Create Route53 hosted zone"
  type        = bool
  default     = false # Set to true if you don't have the zone created
}

# Frontend Variables
variable "frontend_subdomain" {
  description = "Subdomain for frontend"
  type        = string
  default     = "" # Empty for root domain, or "www", "dev", "hml"
}

# Backend Variables
variable "backend_subdomain" {
  description = "Subdomain for backend API"
  type        = string
  default     = "api"
}

variable "backend_container_image" {
  description = "Docker image for backend (will be built and pushed to ECR)"
  type        = string
  default     = "nestjs-api:latest"
}

variable "backend_container_port" {
  description = "Port exposed by backend container"
  type        = number
  default     = 3000
}

variable "backend_cpu" {
  description = "CPU units for backend container (1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "backend_memory" {
  description = "Memory for backend container in MB"
  type        = number
  default     = 1024
}

variable "backend_desired_count" {
  description = "Desired number of backend tasks"
  type        = number
  default     = 1
}

variable "backend_min_capacity" {
  description = "Minimum number of backend tasks for auto scaling"
  type        = number
  default     = 1
}

variable "backend_max_capacity" {
  description = "Maximum number of backend tasks for auto scaling"
  type        = number
  default     = 3
}

# Database Variables
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS in GB"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Name of the database"
  type        = string
  default     = "trya"
}

variable "db_username" {
  description = "Master username for RDS"
  type        = string
  default     = "trya_admin"
  sensitive   = true
}

variable "db_multi_az" {
  description = "Enable Multi-AZ for RDS"
  type        = bool
  default     = false
}

variable "db_backup_retention_period" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

variable "db_backup_window" {
  description = "Preferred backup window"
  type        = string
  default     = "03:00-04:00"
}

variable "db_maintenance_window" {
  description = "Preferred maintenance window"
  type        = string
  default     = "sun:04:00-sun:05:00"
}

# Monitoring Variables
variable "enable_monitoring" {
  description = "Enable CloudWatch monitoring and alarms"
  type        = bool
  default     = true
}

variable "alarm_email" {
  description = "Email for CloudWatch alarms"
  type        = string
  default     = ""
}

# Tags
variable "additional_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}
