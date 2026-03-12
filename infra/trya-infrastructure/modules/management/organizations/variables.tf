variable "create_organization" {
  description = "Create a new AWS Organization (only if not exists)"
  type        = bool
  default     = false
}

variable "root_id" {
  description = "Root ID of existing organization (required if create_organization = false)"
  type        = string
  default     = null
}

variable "aws_service_access_principals" {
  description = "List of AWS service principals to enable"
  type        = list(string)
  default = [
    "cloudtrail.amazonaws.com",
    "config.amazonaws.com",
    "sso.amazonaws.com",
    "guardduty.amazonaws.com",
    "securityhub.amazonaws.com"
  ]
}

variable "enabled_policy_types" {
  description = "List of policy types to enable"
  type        = list(string)
  default     = ["SERVICE_CONTROL_POLICY", "TAG_POLICY"]
}

variable "organizational_units" {
  description = "Map of organizational units to create"
  type = map(object({
    name      = string
    parent_id = optional(string)
    tags      = optional(map(string))
  }))
  default = {}
}

variable "accounts" {
  description = "Map of AWS accounts to create"
  type = map(object({
    name                       = string
    email                      = string
    parent_id                  = optional(string)
    role_name                  = optional(string)
    iam_user_access_to_billing = optional(string)
    close_on_deletion          = optional(bool)
    tags                       = optional(map(string))
  }))
  default = {}
}

variable "service_control_policies" {
  description = "Map of SCPs to create"
  type = map(object({
    name        = string
    description = optional(string)
    content     = string
    tags        = optional(map(string))
  }))
  default = {}
}

variable "scp_attachments" {
  description = "Map of SCP attachments to OUs or accounts"
  type = map(object({
    policy_key = string
    target_id  = string
  }))
  default = {}
}

variable "tags" {
  description = "Default tags for all resources"
  type        = map(string)
  default     = {}
}
