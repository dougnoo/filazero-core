

output "certificate_domain_name" {
  description = "Domain name of the certificate"
  value       = aws_acm_certificate.this.domain_name
}

output "certificate_subject_alternative_names" {
  description = "Subject alternative names of the certificate"
  value       = aws_acm_certificate.this.subject_alternative_names
}

output "certificate_status" {
  description = "Status of the certificate"
  value       = aws_acm_certificate.this.status
}

output "certificate_type" {
  description = "Type of the certificate"
  value       = aws_acm_certificate.this.type
}

output "certificate_key_algorithm" {
  description = "Key algorithm of the certificate"
  value       = aws_acm_certificate.this.key_algorithm
}

output "validation_record_fqdns" {
  description = "List of FQDNs built using the validation records"
  value       = [for record in aws_route53_record.validation : record.fqdn]
}

output "domain_validation_options" {
  description = "Domain validation options for the certificate"
  value       = aws_acm_certificate.this.domain_validation_options
  sensitive   = true
}