# ==============================================================================
# Network Stack Outputs
# ==============================================================================
# These outputs are used by other stacks via terraform_remote_state

output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.network.vpc_id
}

output "vpc_cidr" {
  description = "The CIDR block of the VPC"
  value       = module.network.vpc_cidr
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = module.network.public_subnet_ids
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = module.network.private_subnet_ids
}

output "nat_gateway_ids" {
  description = "List of NAT Gateway IDs"
  value       = module.network.nat_gateway_ids
}

output "internet_gateway_id" {
  description = "Internet Gateway ID"
  value       = module.network.internet_gateway_id
}

output "route53_zone_id" {
  description = "Route53 Hosted Zone ID for the domain"
  value       = data.aws_route53_zone.main.zone_id
}

output "route53_zone_name" {
  description = "Route53 Hosted Zone name"
  value       = data.aws_route53_zone.main.name
}
