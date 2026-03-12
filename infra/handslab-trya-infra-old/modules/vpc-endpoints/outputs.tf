# ==============================================================================
# VPC Endpoints Module Outputs
# ==============================================================================

output "s3_endpoint_id" {
  description = "ID of the S3 Gateway endpoint"
  value       = var.create_s3_endpoint ? aws_vpc_endpoint.s3[0].id : null
}

output "dynamodb_endpoint_id" {
  description = "ID of the DynamoDB Gateway endpoint"
  value       = var.create_dynamodb_endpoint ? aws_vpc_endpoint.dynamodb[0].id : null
}

output "bedrock_runtime_endpoint_id" {
  description = "ID of the Bedrock Runtime interface endpoint"
  value       = var.create_bedrock_runtime_endpoint ? aws_vpc_endpoint.bedrock_runtime[0].id : null
}

output "bedrock_agent_runtime_endpoint_id" {
  description = "ID of the Bedrock Agent Runtime interface endpoint"
  value       = var.create_bedrock_agent_runtime_endpoint ? aws_vpc_endpoint.bedrock_agent_runtime[0].id : null
}

output "transcribe_endpoint_id" {
  description = "ID of the Transcribe interface endpoint"
  value       = var.create_transcribe_endpoint ? aws_vpc_endpoint.transcribe[0].id : null
}

output "secrets_manager_endpoint_id" {
  description = "ID of the Secrets Manager interface endpoint"
  value       = var.create_secrets_manager_endpoint ? aws_vpc_endpoint.secrets_manager[0].id : null
}

output "ecr_api_endpoint_id" {
  description = "ID of the ECR API interface endpoint"
  value       = var.create_ecr_endpoints ? aws_vpc_endpoint.ecr_api[0].id : null
}

output "ecr_dkr_endpoint_id" {
  description = "ID of the ECR DKR interface endpoint"
  value       = var.create_ecr_endpoints ? aws_vpc_endpoint.ecr_dkr[0].id : null
}

output "logs_endpoint_id" {
  description = "ID of the CloudWatch Logs interface endpoint"
  value       = var.create_logs_endpoint ? aws_vpc_endpoint.logs[0].id : null
}

output "sts_endpoint_id" {
  description = "ID of the STS interface endpoint"
  value       = var.create_sts_endpoint ? aws_vpc_endpoint.sts[0].id : null
}
