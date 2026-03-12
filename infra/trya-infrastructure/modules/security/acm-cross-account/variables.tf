variable "domain_name" {
  description = "Primary domain name for the certificate"
  type        = string
}

variable "subject_alternative_names" {
  description = "List of additional domain names for the certificate"
  type        = list(string)
  default     = []
}

variable "validation_method" {
  description = "Method to use for domain validation (DNS or EMAIL)"
  type        = string
  default     = "DNS"
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID for DNS validation"
  type        = string
}

variable "route53_assume_role_arn" {
  description = "ARN of the IAM role to assume for Route53 operations in the DNS account"
  type        = string
}

variable "dns_account_region" {
  description = "AWS region for the DNS account operations"
  type        = string
  default     = "us-east-1"
}

variable "certificate_transparency_logging_preference" {
  description = "Certificate transparency logging preference"
  type        = string
  default     = "ENABLED"
}

variable "key_algorithm" {
  description = "Key algorithm for the certificate"
  type        = string
  default     = "RSA_2048"
}

variable "validation_timeout" {
  description = "Timeout for certificate validation"
  type        = string
  default     = "5m"
}

variable "tags" {
  description = "Tags to apply to the certificate"
  type        = map(string)
  default     = {}
}