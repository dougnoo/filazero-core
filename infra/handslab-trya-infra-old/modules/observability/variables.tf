variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "ecs_cluster_name" {
  description = "ECS cluster name"
  type        = string
}

variable "ecs_service_name" {
  description = "ECS service name"
  type        = string
}

variable "alb_arn_suffix" {
  description = "ALB ARN suffix"
  type        = string
}

variable "target_group_arn_suffix" {
  description = "Target group ARN suffix"
  type        = string
}

variable "rds_instance_id" {
  description = "RDS instance ID"
  type        = string
}

variable "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  type        = string
}

variable "alarm_email" {
  description = "Email address for alarms"
  type        = string
  default     = ""
}

variable "cpu_threshold" {
  description = "CPU utilization threshold for ECS alarm"
  type        = number
  default     = 80
}

variable "memory_threshold" {
  description = "Memory utilization threshold for ECS alarm"
  type        = number
  default     = 80
}

variable "response_time_threshold" {
  description = "Response time threshold for ALB alarm (seconds)"
  type        = number
  default     = 2
}

variable "error_5xx_threshold" {
  description = "5XX error count threshold for ALB alarm"
  type        = number
  default     = 10
}

variable "rds_cpu_threshold" {
  description = "CPU utilization threshold for RDS alarm"
  type        = number
  default     = 80
}

variable "rds_storage_threshold" {
  description = "Free storage threshold for RDS alarm (bytes)"
  type        = number
  default     = 2147483648  # 2GB
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
