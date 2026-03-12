output "zone_id" {
  description = "Route53 zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "name_servers" {
  description = "Name servers for the zone"
  value       = aws_route53_zone.main.name_servers
}

output "zone_arn" {
  description = "ARN of the hosted zone"
  value       = aws_route53_zone.main.arn
}
