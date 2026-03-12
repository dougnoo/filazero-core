# Network Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.network.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.network.private_subnet_ids
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.network.public_subnet_ids
}

# ECR Outputs
output "ecr_repository_urls" {
  description = "ECR repository URLs"
  value       = module.ecr.repository_urls
}

# Frontend Outputs
output "frontend_url" {
  description = "Frontend URL"
  value       = "https://${local.frontend_domain}"
}

output "frontend_bucket_name" {
  description = "Frontend S3 bucket name"
  value       = module.s3_frontend.bucket_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name"
  value       = module.cloudfront.distribution_domain_name
}

# Backend Outputs
output "backend_url" {
  description = "Backend API URL"
  value       = "https://${local.backend_domain}"
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.ecs_service.alb_dns_name
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs_service.cluster_name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = module.ecs_service.service_name
}

# Database Outputs
output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.endpoint
  sensitive   = true
}

output "rds_port" {
  description = "RDS port"
  value       = module.rds.port
}

output "database_name" {
  description = "Database name"
  value       = var.db_name
}

# Secrets Outputs
output "secrets_arns" {
  description = "ARNs of all secrets"
  value       = module.secrets.secret_arns
  sensitive   = true
}

# Route53 Outputs
output "route53_zone_id" {
  description = "Route53 hosted zone ID"
  value       = var.create_route53_zone ? module.route53[0].zone_id : data.aws_route53_zone.main[0].zone_id
}

output "route53_name_servers" {
  description = "Route53 name servers (if zone was created)"
  value       = var.create_route53_zone ? module.route53[0].name_servers : []
}

# Monitoring Outputs
output "cloudwatch_dashboard_url" {
  description = "CloudWatch dashboard URL"
  value       = var.enable_monitoring ? "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${module.observability[0].dashboard_name}" : ""
}

# Summary Output
output "deployment_summary" {
  description = "Summary of deployed resources"
  value = {
    environment        = var.environment
    region             = var.aws_region
    frontend_url       = "https://${local.frontend_domain}"
    backend_url        = "https://${local.backend_domain}"
    ecr_backend_repo   = module.ecr.repository_urls["backend"]
    cloudfront_dist_id = module.cloudfront.distribution_id
    ecs_cluster        = module.ecs_service.cluster_name
    ecs_service        = module.ecs_service.service_name
  }
}
