variable "role_name" {
  description = "Name of the IAM role for cross-account Route53 access"
  type        = string
  default     = "Route53CrossAccountAccess"
}

variable "trusted_account_ids" {
  description = "List of AWS account IDs that can assume this role"
  type        = list(string)
}

variable "route53_zone_arns" {
  description = "List of Route53 hosted zone ARNs to grant access to"
  type        = list(string)
  default     = ["*"]
}

variable "tags" {
  description = "Tags to apply to the IAM role"
  type        = map(string)
  default     = {}
}