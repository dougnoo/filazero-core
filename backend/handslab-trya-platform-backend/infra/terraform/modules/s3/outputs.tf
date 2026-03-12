output "bucket_name" {
  description = "Nome do bucket S3"
  value       = aws_s3_bucket.platform_assets.bucket
}

output "bucket_arn" {
  description = "ARN do bucket S3"
  value       = aws_s3_bucket.platform_assets.arn
}

output "bucket_domain_name" {
  description = "Domain name do bucket S3"
  value       = aws_s3_bucket.platform_assets.bucket_domain_name
}

output "bucket_regional_domain_name" {
  description = "Regional domain name do bucket S3"
  value       = aws_s3_bucket.platform_assets.bucket_regional_domain_name
}