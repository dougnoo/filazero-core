output "user_pool_id" {
  description = "ID of the Cognito User Pool (COGNITO_USER_POOL_ID)"
  value       = aws_cognito_user_pool.this.id
}

output "user_pool_arn" {
  description = "ARN of the Cognito User Pool"
  value       = aws_cognito_user_pool.this.arn
}

output "user_pool_client_id" {
  description = "ID of the Cognito User Pool Client (COGNITO_CLIENT_ID)"
  value       = var.create_client ? aws_cognito_user_pool_client.this[0].id : null
}

output "user_pool_client_secret" {
  description = "Secret of the Cognito User Pool Client (COGNITO_CLIENT_SECRET)"
  value       = var.create_client && var.generate_client_secret ? aws_cognito_user_pool_client.this[0].client_secret : null
  sensitive   = true
}

output "user_pool_domain" {
  description = "Domain of the Cognito User Pool (COGNITO_DOMAIN)"
  value       = var.domain != null ? aws_cognito_user_pool_domain.this[0].domain : null
}

output "user_pool_hosted_ui_url" {
  description = "Hosted UI URL of the Cognito User Pool"
  value       = var.domain != null ? "https://${aws_cognito_user_pool_domain.this[0].domain}.auth.${data.aws_region.current.name}.amazoncognito.com" : null
}

output "region" {
  description = "AWS Region (COGNITO_REGION)"
  value       = data.aws_region.current.name
}

output "user_groups" {
  description = "Created user groups"
  value       = { for k, v in aws_cognito_user_group.groups : k => v.name }
}

data "aws_region" "current" {}