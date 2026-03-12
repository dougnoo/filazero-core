# =============================================================================
# Platform Files Bucket Outputs
# =============================================================================

output "bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.platform_files.id
}

output "bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.platform_files.arn
}

output "bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  value       = aws_s3_bucket.platform_files.bucket_domain_name
}

output "bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket"
  value       = aws_s3_bucket.platform_files.bucket_regional_domain_name
}

output "bucket_url" {
  description = "HTTPS URL for the bucket"
  value       = "https://${aws_s3_bucket.platform_files.bucket}.s3.${var.region}.amazonaws.com"
}

output "policy_arn" {
  description = "ARN of the IAM policy for bucket access (if created)"
  value       = var.create_iam_policy ? aws_iam_policy.bucket_access[0].arn : null
}
