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

variable "tags" {
  description = "Tags para os recursos"
  type        = map(string)
  default     = {}
}