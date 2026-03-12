# ==============================================================================
# DynamoDB Module Variables
# ==============================================================================

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "table_name" {
  description = "Name of the DynamoDB table"
  type        = string
}

variable "billing_mode" {
  description = "Billing mode for the table (PROVISIONED or PAY_PER_REQUEST)"
  type        = string
  default     = "PAY_PER_REQUEST"
}

variable "hash_key" {
  description = "Hash key for the table"
  type        = string
}

variable "hash_key_type" {
  description = "Type of the hash key (S, N, B)"
  type        = string
  default     = "S"
}

variable "range_key" {
  description = "Range key for the table (optional)"
  type        = string
  default     = null
}

variable "range_key_type" {
  description = "Type of the range key (S, N, B)"
  type        = string
  default     = "S"
}

variable "attributes" {
  description = "Additional attributes for the table"
  type = list(object({
    name = string
    type = string
  }))
  default = []
}

variable "ttl_enabled" {
  description = "Enable TTL for the table"
  type        = bool
  default     = false
}

variable "ttl_attribute_name" {
  description = "Name of the TTL attribute"
  type        = string
  default     = "ttl"
}

variable "point_in_time_recovery_enabled" {
  description = "Enable point-in-time recovery"
  type        = bool
  default     = false
}

variable "server_side_encryption_enabled" {
  description = "Enable server-side encryption"
  type        = bool
  default     = true
}

variable "global_secondary_indexes" {
  description = "Global secondary indexes for the table"
  type = list(object({
    name               = string
    hash_key           = string
    range_key          = optional(string)
    projection_type    = optional(string)
    non_key_attributes = optional(list(string))
  }))
  default = []
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
