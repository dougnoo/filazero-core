variable "repository_name" {
  description = "Name of the ECR repository"
  type        = string
}

variable "image_tag_mutability" {
  description = "Image tag mutability setting (MUTABLE or IMMUTABLE)"
  type        = string
  default     = "MUTABLE"
}

variable "scan_on_push" {
  description = "Enable image scanning on push"
  type        = bool
  default     = true
}

variable "kms_key_arn" {
  description = "ARN of KMS key for ECR encryption"
  type        = string
  default     = null
}

variable "max_image_count" {
  description = "Maximum number of images to keep"
  type        = number
  default     = 15
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
