variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "secrets" {
  description = "Map of secrets to create in Secrets Manager"
  type = map(object({
    description = string
  }))
  default = {}
}

variable "parameters" {
  description = "Map of parameters to create in SSM Parameter Store"
  type = map(object({
    description = string
    value       = string
    type        = optional(string, "String")
    tier        = optional(string, "Standard")
  }))
  default = {}
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
