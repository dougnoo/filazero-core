output "certificate_arn" {
  description = "ARN do certificado ACM"
  value       = aws_acm_certificate.this.arn
}

output "certificate_domain_name" {
  description = "Nome do domínio do certificado"
  value       = aws_acm_certificate.this.domain_name
}

output "certificate_status" {
  description = "Status do certificado"
  value       = aws_acm_certificate.this.status
}

# Outputs para validação DNS (usar na conta DNS)
output "dns_validation_records" {
  description = "Registros DNS necessários para validação (criar na conta DNS)"
  value = {
    for dvo in aws_acm_certificate.this.domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }
}

# Comando AWS CLI para criar os registros (helper)
output "cli_validation_commands" {
  description = "Comandos AWS CLI para criar os registros de validação (execute na conta DNS)"
  value = [
    for dvo in aws_acm_certificate.this.domain_validation_options :
    "aws route53 change-resource-record-sets --hosted-zone-id <ZONE_ID> --change-batch '{\"Changes\":[{\"Action\":\"UPSERT\",\"ResourceRecordSet\":{\"Name\":\"${dvo.resource_record_name}\",\"Type\":\"${dvo.resource_record_type}\",\"TTL\":300,\"ResourceRecords\":[{\"Value\":\"${dvo.resource_record_value}\"}]}}]}'"
  ]
}
