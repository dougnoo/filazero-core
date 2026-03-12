variable "bucket_name" {
  description = "Nome do bucket para logs"
  type        = string
}

variable "kms_key_arn" {
  description = "ARN da chave KMS para criptografia"
  type        = string
  default     = null
}

variable "log_retention_days" {
  description = "Dias para reter logs antes de deletar"
  type        = number
  default     = 365
}

variable "tags" {
  description = "Tags para o bucket"
  type        = map(string)
  default     = {}
}
