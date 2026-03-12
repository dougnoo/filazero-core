variable "dashboard_name" {
  description = "Name of the CloudWatch dashboard"
  type        = string
}

variable "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
}

variable "ecs_service_name" {
  description = "Name of the ECS service"
  type        = string
}

variable "alb_arn_suffix" {
  description = "ARN suffix of the ALB"
  type        = string
  default     = null
}

variable "aurora_cluster_identifier" {
  description = "Aurora cluster identifier"
  type        = string
  default     = null
}

variable "create_alarms" {
  description = "Create CloudWatch alarms"
  type        = bool
  default     = true
}

variable "create_sns_topic" {
  description = "Create SNS topic for alarms"
  type        = bool
  default     = true
}

variable "alarm_actions" {
  description = "List of ARNs to notify on alarm"
  type        = list(string)
  default     = []
}

variable "ok_actions" {
  description = "List of ARNs to notify when alarm recovers"
  type        = list(string)
  default     = []
}

variable "ecs_cpu_threshold" {
  description = "ECS CPU utilization alarm threshold"
  type        = number
  default     = 80
}

variable "ecs_memory_threshold" {
  description = "ECS memory utilization alarm threshold"
  type        = number
  default     = 85
}

variable "alb_5xx_threshold" {
  description = "ALB 5XX errors alarm threshold"
  type        = number
  default     = 10
}

variable "alb_response_time_threshold" {
  description = "ALB response time alarm threshold in seconds"
  type        = number
  default     = 2
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

