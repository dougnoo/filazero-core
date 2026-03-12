variable "environment" {
  description = "Environment name (dev, hml, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "hml", "prod"], var.environment)
    error_message = "Environment must be one of: dev, hml, prod."
  }
}

variable "tenant_names" {
  description = "List of tenant names to grant access to"
  type        = list(string)
  default     = ["trya", "grupotrigo"]
}

variable "create_write_policy" {
  description = "Create a write access policy in addition to read policy"
  type        = bool
  default     = true
}

variable "read_access_role_names" {
  description = "List of IAM role names to attach the read access policy to"
  type        = list(string)
  default     = []
}

variable "write_access_role_names" {
  description = "List of IAM role names to attach the write access policy to"
  type        = list(string)
  default     = []
}
