variable "pool_name" {
  description = "Name of the Cognito User Pool"
  type        = string
}

variable "password_minimum_length" {
  description = "Minimum password length"
  type        = number
  default     = 8
}

variable "password_require_lowercase" {
  description = "Require lowercase characters"
  type        = bool
  default     = true
}

variable "password_require_uppercase" {
  description = "Require uppercase characters"
  type        = bool
  default     = true
}

variable "password_require_numbers" {
  description = "Require numbers"
  type        = bool
  default     = true
}

variable "password_require_symbols" {
  description = "Require symbols"
  type        = bool
  default     = true
}

variable "temporary_password_validity_days" {
  description = "Temporary password validity in days"
  type        = number
  default     = 7
}

variable "mfa_configuration" {
  description = "MFA configuration (OFF, ON, OPTIONAL)"
  type        = string
  default     = "OPTIONAL"
}

variable "ses_email_identity" {
  description = "SES email identity ARN for sending emails"
  type        = string
  default     = null
}

variable "from_email_address" {
  description = "From email address"
  type        = string
  default     = null
}

variable "sns_caller_arn" {
  description = "SNS caller ARN for SMS"
  type        = string
  default     = null
}

variable "sns_external_id" {
  description = "SNS external ID"
  type        = string
  default     = null
}

variable "sns_region" {
  description = "SNS region"
  type        = string
  default     = null
}

variable "auto_verified_attributes" {
  description = "Auto-verified attributes"
  type        = list(string)
  default     = ["email"]
}

variable "custom_attributes" {
  description = "Custom user attributes"
  type        = list(any)
  default     = []
}

variable "create_client" {
  description = "Create user pool client"
  type        = bool
  default     = true
}

variable "generate_client_secret" {
  description = "Generate client secret"
  type        = bool
  default     = true
}

variable "explicit_auth_flows" {
  description = "Explicit authentication flows"
  type        = list(string)
  default     = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]
}

variable "supported_identity_providers" {
  description = "Supported identity providers"
  type        = list(string)
  default     = ["COGNITO"]
}

variable "allowed_oauth_flows" {
  description = "Allowed OAuth flows"
  type        = list(string)
  default     = []
}

variable "allowed_oauth_scopes" {
  description = "Allowed OAuth scopes"
  type        = list(string)
  default     = []
}

variable "callback_urls" {
  description = "Callback URLs"
  type        = list(string)
  default     = []
}

variable "logout_urls" {
  description = "Logout URLs"
  type        = list(string)
  default     = []
}

variable "access_token_validity" {
  description = "Access token validity in hours"
  type        = number
  default     = 1
}

variable "id_token_validity" {
  description = "ID token validity in hours"
  type        = number
  default     = 1
}

variable "refresh_token_validity" {
  description = "Refresh token validity in days"
  type        = number
  default     = 30
}

variable "read_attributes" {
  description = "Read attributes"
  type        = list(string)
  default     = []
}

variable "write_attributes" {
  description = "Write attributes"
  type        = list(string)
  default     = []
}

variable "domain" {
  description = "Cognito domain"
  type        = string
  default     = null
}

variable "domain_certificate_arn" {
  description = "ACM certificate ARN for custom domain"
  type        = string
  default     = null
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID for custom domain"
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "user_groups" {
  description = "User groups to create in the pool"
  type = map(object({
    description = optional(string)
    precedence  = optional(number)
    role_arn    = optional(string)
  }))
  default = {}
}
