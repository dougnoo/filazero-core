variable "domain" {
  description = "Domain to verify for SES"
  type        = string
  default     = null
}

variable "enable_dkim" {
  description = "Enable DKIM for domain"
  type        = bool
  default     = true
}

variable "email_identities" {
  description = "List of email addresses to verify"
  type        = list(string)
  default     = []
}

variable "create_configuration_set" {
  description = "Create SES configuration set"
  type        = bool
  default     = true
}

variable "configuration_set_name" {
  description = "Name of the configuration set"
  type        = string
}

variable "tls_policy" {
  description = "TLS policy (Require or Optional)"
  type        = string
  default     = "Require"
}

variable "enable_cloudwatch_destination" {
  description = "Enable CloudWatch event destination"
  type        = bool
  default     = true
}

variable "cloudwatch_event_types" {
  description = "Event types to send to CloudWatch"
  type        = list(string)
  default     = ["send", "reject", "bounce", "complaint", "delivery"]
}

variable "create_cognito_policy" {
  description = "Create IAM policy for Cognito"
  type        = bool
  default     = false
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID for DNS records"
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
