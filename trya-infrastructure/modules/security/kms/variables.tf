variable "description" {
  description = "Description of the KMS key"
  type        = string
}

variable "alias_name" {
  description = "Alias name for the KMS key"
  type        = string
}

variable "deletion_window_in_days" {
  description = "Duration in days after which the key is deleted after destruction"
  type        = number
  default     = 30
}

variable "multi_region" {
  description = "Whether the key is multi-region"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply to the KMS key"
  type        = map(string)
  default     = {}
}
