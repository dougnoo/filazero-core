variable "domain_name" {
  description = "Domain name for the hosted zone"
  type        = string
}

variable "comment" {
  description = "Comment for the hosted zone"
  type        = string
  default     = ""
}

variable "enable_health_check" {
  description = "Enable Route53 health check"
  type        = bool
  default     = false
}

variable "health_check_fqdn" {
  description = "FQDN for health check"
  type        = string
  default     = null
}

variable "health_check_port" {
  description = "Port for health check"
  type        = number
  default     = 443
}

variable "health_check_type" {
  description = "Health check type (HTTP, HTTPS, TCP)"
  type        = string
  default     = "HTTPS"
}

variable "health_check_path" {
  description = "Path for HTTP/HTTPS health check"
  type        = string
  default     = "/health"
}

variable "health_check_failure_threshold" {
  description = "Number of consecutive failures before marking unhealthy"
  type        = number
  default     = 3
}

variable "health_check_interval" {
  description = "Health check interval in seconds (10 or 30)"
  type        = number
  default     = 30
}

variable "alarm_actions" {
  description = "SNS topic ARNs for health check alarms"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
