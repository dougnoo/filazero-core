output "zone_id" {
  description = "The hosted zone ID"
  value       = aws_route53_zone.this.zone_id
}

output "zone_arn" {
  description = "The hosted zone ARN"
  value       = aws_route53_zone.this.arn
}

output "name_servers" {
  description = "List of name servers for the hosted zone"
  value       = aws_route53_zone.this.name_servers
}

output "domain_name" {
  description = "The domain name"
  value       = aws_route53_zone.this.name
}

output "health_check_id" {
  description = "Health check ID"
  value       = var.enable_health_check ? aws_route53_health_check.this[0].id : null
}
