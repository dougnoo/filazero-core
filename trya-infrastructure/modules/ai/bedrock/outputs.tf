output "available_models" {
  description = "List of available Bedrock models"
  value       = data.aws_bedrock_foundation_models.available.model_summaries
}

output "invoke_role_arn" {
  description = "ARN of the Bedrock invoke role"
  value       = var.create_invoke_role ? aws_iam_role.bedrock_invoke[0].arn : null
}

output "invoke_role_name" {
  description = "Name of the Bedrock invoke role"
  value       = var.create_invoke_role ? aws_iam_role.bedrock_invoke[0].name : null
}
