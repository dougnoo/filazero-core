# =============================================================================
# Lambda Security Group Module - Outputs
# =============================================================================

output "security_group_id" {
  description = "ID of the Lambda security group"
  value       = aws_security_group.lambda.id
}

output "security_group_arn" {
  description = "ARN of the Lambda security group"
  value       = aws_security_group.lambda.arn
}

output "security_group_name" {
  description = "Name of the Lambda security group"
  value       = aws_security_group.lambda.name
}
