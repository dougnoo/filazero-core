# ==============================================================================
# ECR Outputs
# ==============================================================================
output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = module.ecr.repository_url
}

output "ecr_repository_name" {
  description = "Name of the ECR repository"
  value       = module.ecr.repository_name
}

# ==============================================================================
# ALB Outputs
# ==============================================================================
output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.load_balancer_dns_name
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = module.alb.load_balancer_arn
}

output "alb_target_group_arn" {
  description = "ARN of the ALB target group"
  value       = module.alb.target_group_arn
}

# ==============================================================================
# WAF Outputs
# ==============================================================================
output "waf_web_acl_arn" {
  description = "ARN of the WAF Web ACL"
  value       = module.waf.web_acl_arn
}

# ==============================================================================
# ECS Outputs
# ==============================================================================
output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = module.ecs.cluster_arn
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = module.ecs.service_name
}

output "ecs_task_definition_arn" {
  description = "ARN of the ECS task definition"
  value       = module.ecs.task_definition_arn
}

output "ecs_task_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  value       = module.ecs.task_execution_role_arn
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  value       = module.ecs.task_role_arn
}

output "ecs_security_group_id" {
  description = "ID of the ECS tasks security group"
  value       = module.ecs.security_group_id
}

# ==============================================================================
# Aurora Outputs
# ==============================================================================
output "aurora_cluster_endpoint" {
  description = "Writer endpoint for Aurora cluster"
  value       = var.use_aurora ? module.aurora[0].cluster_endpoint : null
}

output "aurora_reader_endpoint" {
  description = "Reader endpoint for Aurora cluster"
  value       = var.use_aurora ? module.aurora[0].cluster_reader_endpoint : null
}

output "aurora_security_group_id" {
  description = "ID of the Aurora security group"
  value       = var.use_aurora ? module.aurora[0].security_group_id : null
}

# ==============================================================================
# CloudWatch Outputs
# ==============================================================================
output "cloudwatch_dashboard_name" {
  description = "Name of the CloudWatch dashboard"
  value       = module.cloudwatch.dashboard_name
}

output "cloudwatch_sns_topic_arn" {
  description = "ARN of the CloudWatch alarms SNS topic"
  value       = module.cloudwatch.sns_topic_arn
}

# ==============================================================================
# Deployment Information
# ==============================================================================
output "api_endpoint" {
  description = "API endpoint URL"
  value       = "https://${module.alb.load_balancer_dns_name}/api"
}

output "health_check_url" {
  description = "Health check URL"
  value       = "https://${module.alb.load_balancer_dns_name}/api/health"
}

output "deployment_info" {
  description = "Deployment information for CI/CD"
  value = {
    ecr_repository      = module.ecr.repository_url
    ecs_cluster         = module.ecs.cluster_name
    ecs_service         = module.ecs.service_name
    ecs_task_definition = module.ecs.task_definition_family
  }
}

