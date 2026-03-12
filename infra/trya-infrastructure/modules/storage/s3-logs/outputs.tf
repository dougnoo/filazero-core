output "bucket_id" {
  description = "ID do bucket de logs"
  value       = aws_s3_bucket.logs.id
}

output "bucket_arn" {
  description = "ARN do bucket de logs"
  value       = aws_s3_bucket.logs.arn
}

output "bucket_domain_name" {
  description = "Domain name do bucket (para CloudFront logging)"
  value       = aws_s3_bucket.logs.bucket_domain_name
}
