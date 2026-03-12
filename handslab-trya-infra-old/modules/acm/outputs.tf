output "certificate_arn" {
  description = "ARN of the certificate"
  value       = aws_acm_certificate_validation.main.certificate_arn
}

output "certificate_id" {
  description = "ID of the certificate"
  value       = aws_acm_certificate.main.id
}

output "domain_name" {
  description = "Domain name of the certificate"
  value       = aws_acm_certificate.main.domain_name
}
