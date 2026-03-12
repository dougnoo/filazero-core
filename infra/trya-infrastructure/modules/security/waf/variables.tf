variable "name" {
  description = "Name of the WAF Web ACL"
  type        = string
}

variable "description" {
  description = "Description of the WAF Web ACL"
  type        = string
  default     = "WAF Web ACL for API protection"
}

variable "scope" {
  description = "Scope of the WAF (REGIONAL or CLOUDFRONT)"
  type        = string
  default     = "REGIONAL"
}

variable "alb_arn" {
  description = "ARN of the ALB to associate with WAF"
  type        = string
  default     = null
}

variable "enable_rate_limiting" {
  description = "Enable rate limiting rule"
  type        = bool
  default     = true
}

variable "rate_limit" {
  description = "Rate limit per 5 minute period per IP"
  type        = number
  default     = 2000
}

variable "enable_ip_block_list" {
  description = "Enable IP block list"
  type        = bool
  default     = false
}

variable "blocked_ip_addresses" {
  description = "List of IP addresses to block (CIDR notation)"
  type        = list(string)
  default     = []
}

variable "enable_geo_blocking" {
  description = "Enable geo blocking"
  type        = bool
  default     = false
}

variable "blocked_countries" {
  description = "List of country codes to block"
  type        = list(string)
  default     = []
}

variable "enable_linux_rule_set" {
  description = "Enable AWS Managed Linux Rule Set"
  type        = bool
  default     = true
}

variable "common_rule_set_excluded_rules" {
  description = "List of rules to exclude from Common Rule Set"
  type        = list(string)
  default     = []
}

variable "enable_logging" {
  description = "Enable WAF logging"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "Log retention in days"
  type        = number
  default     = 365
}

variable "kms_key_id" {
  description = "KMS key ID for CloudWatch Logs encryption"
  type        = string
  default     = null
}

variable "redacted_fields" {
  description = "Fields to redact from logs"
  type = list(object({
    type = string
    name = string
  }))
  default = [
    {
      type = "single_header"
      name = "authorization"
    }
  ]
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

