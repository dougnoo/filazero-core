variable "domain_name" {
  description = "Nome do domínio principal para o certificado"
  type        = string
}

variable "subject_alternative_names" {
  description = "Nomes alternativos (SANs) para o certificado"
  type        = list(string)
  default     = []
}

variable "environment" {
  description = "Ambiente (dev, hml, prod)"
  type        = string
}

variable "wait_for_validation" {
  description = "Aguardar validação do certificado (só habilite se os registros DNS já existirem)"
  type        = bool
  default     = false
}

variable "validation_timeout" {
  description = "Timeout para aguardar validação"
  type        = string
  default     = "30m"
}

variable "tags" {
  description = "Tags adicionais"
  type        = map(string)
  default     = {}
}
