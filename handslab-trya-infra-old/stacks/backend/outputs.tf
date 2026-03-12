# ==============================================================================
# Backend Stack Outputs
# ==============================================================================

output "ecr_repository_url" {
  description = "ECR repository URL for the backend"
  value       = module.ecr.repository_urls["backend"]
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs_service.cluster_name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = module.ecs_service.service_name
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.ecs_service.alb_dns_name
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = module.ecs_service.alb_arn
}

output "backend_url" {
  description = "URL of the backend API"
  value       = "https://${aws_route53_record.backend.fqdn}"
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.endpoint
}

output "rds_port" {
  description = "RDS port"
  value       = module.rds.port
}

output "security_group_id" {
  description = "Security group ID for ECS tasks"
  value       = aws_security_group.ecs_tasks.id
}

output "database_password_secret_arn" {
  description = "ARN of the database password secret"
  value       = try(module.secrets.secret_arns["database_password"], "pending-import")
}

output "jwt_secret_arn" {
  description = "ARN of the JWT secret"
  value       = try(module.secrets.secret_arns["jwt_secret"], "pending-import")
}
