variable "identity_pool_name" {
  description = "Name of the Cognito Identity Pool"
  type        = string
}

variable "allow_unauthenticated_identities" {
  description = "Allow unauthenticated identities"
  type        = bool
  default     = false
}

variable "allow_classic_flow" {
  description = "Allow classic flow"
  type        = bool
  default     = false
}

variable "cognito_identity_providers" {
  description = "Cognito identity providers configuration"
  type = list(object({
    client_id               = string
    provider_name           = string
    server_side_token_check = optional(bool, false)
  }))
  default = []
}

variable "saml_provider_arns" {
  description = "SAML provider ARNs"
  type        = list(string)
  default     = []
}

variable "openid_connect_provider_arns" {
  description = "OpenID Connect provider ARNs"
  type        = list(string)
  default     = []
}

variable "supported_login_providers" {
  description = "Supported login providers"
  type        = map(string)
  default     = {}
}

variable "authenticated_policy_statements" {
  description = "Additional policy statements for authenticated users"
  type        = list(any)
  default     = []
}

variable "unauthenticated_policy_statements" {
  description = "Additional policy statements for unauthenticated users"
  type        = list(any)
  default     = []
}

variable "role_mappings" {
  description = "Role mappings configuration"
  type = list(object({
    identity_provider         = string
    ambiguous_role_resolution = optional(string, "AuthenticatedRole")
    type                      = optional(string, "Token")
    mapping_rules = optional(list(object({
      claim      = string
      match_type = string
      role_arn   = string
      value      = string
    })), [])
  }))
  default = []
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}