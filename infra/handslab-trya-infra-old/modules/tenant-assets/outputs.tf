output "bucket_id" {
  description = "S3 bucket ID"
  value       = aws_s3_bucket.tenant_assets.id
}

output "bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.tenant_assets.arn
}

output "bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.tenant_assets.bucket
}

output "bucket_regional_domain_name" {
  description = "S3 bucket regional domain name"
  value       = aws_s3_bucket.tenant_assets.bucket_regional_domain_name
}

output "bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = aws_s3_bucket.tenant_assets.bucket_domain_name
}

output "bucket_url" {
  description = "Public URL for the bucket"
  value       = "https://${aws_s3_bucket.tenant_assets.bucket}.s3.${var.region}.amazonaws.com"
}

output "tenant_name" {
  description = "Tenant name this bucket belongs to"
  value       = var.tenant_name
}

output "environment" {
  description = "Environment this bucket is deployed to"
  value       = var.environment
}

# IAM Outputs
output "bucket_access_policy_arn" {
  description = "ARN of the IAM policy for bucket access"
  value       = var.create_iam_policy ? aws_iam_policy.bucket_access[0].arn : null
}

output "bucket_access_policy_name" {
  description = "Name of the IAM policy for bucket access"
  value       = var.create_iam_policy ? aws_iam_policy.bucket_access[0].name : null
}
