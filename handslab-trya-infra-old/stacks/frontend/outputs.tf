# ==============================================================================
# Frontend Stack Outputs
# ==============================================================================

output "ecr_repository_url" {
  description = "ECR repository URL for the frontend"
  value       = module.ecr.repository_urls["frontend"]
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

output "frontend_url" {
  description = "URL of the frontend application"
  value       = "https://${aws_route53_record.frontend.fqdn}"
}

output "security_group_id" {
  description = "Security group ID for ECS tasks"
  value       = aws_security_group.ecs_tasks.id
}
