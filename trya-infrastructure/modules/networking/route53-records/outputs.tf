output "record_fqdns" {
  description = "Map of record names to their FQDNs"
  value = {
    for k, v in aws_route53_record.this : k => v.fqdn
  }
}

output "record_names" {
  description = "List of created record names"
  value       = [for v in aws_route53_record.this : v.name]
}
