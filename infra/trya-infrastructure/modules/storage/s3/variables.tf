variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente (dev, staging, prod)"
  type        = string
}

variable "bucket_name" {
  description = "Nome do bucket S3 para assets"
  type        = string
}

variable "cors_allowed_origins" {
  description = "Origens permitidas para CORS"
  type        = list(string)
  default     = ["http://localhost:3000", "http://localhost:3001"]
}

variable "kms_key_arn" {
  description = "ARN da chave KMS para criptografia"
  type        = string
  default     = null
}

variable "logging_bucket" {
  description = "Bucket S3 para access logs"
  type        = string
  default     = null
}

variable "enable_notifications" {
  description = "Habilitar notificações de eventos S3"
  type        = bool
  default     = false
}

variable "sns_topic_arn" {
  description = "ARN do tópico SNS para notificações"
  type        = string
  default     = null
}

variable "cloudfront_oai_iam_arn" {
  description = "IAM ARN do CloudFront Origin Access Identity"
  type        = string
  default     = null
}

variable "additional_policy_statements" {
  description = "Statements adicionais para bucket policy"
  type        = list(any)
  default     = []
}

variable "create_folders" {
  description = "Lista de pastas (prefixos) para criar no bucket"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags para os recursos"
  type        = map(string)
  default     = {}
}