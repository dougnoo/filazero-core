variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "create_invoke_role" {
  description = "Create IAM role for invoking Bedrock"
  type        = bool
  default     = true
}

variable "assume_role_services" {
  description = "Services that can assume the role"
  type        = list(string)
  default     = ["lambda.amazonaws.com"]
}

variable "allowed_model_arns" {
  description = "ARNs of allowed Bedrock models"
  type        = list(string)
  default     = ["arn:aws:bedrock:*:*:foundation-model/*"]
}

variable "knowledge_base_arns" {
  description = "ARNs of Knowledge Bases"
  type        = list(string)
  default     = ["*"]
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
