# S3 Bucket para assets da plataforma
resource "aws_s3_bucket" "platform_assets" {
  bucket = var.bucket_name

  tags = merge(var.tags, {
    Name        = "${var.project_name}-${var.environment}-assets"
    Environment = var.environment
    Purpose     = "Platform assets storage"
  })
}

# Configuração de versionamento
resource "aws_s3_bucket_versioning" "platform_assets" {
  bucket = aws_s3_bucket.platform_assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Configuração de criptografia
resource "aws_s3_bucket_server_side_encryption_configuration" "platform_assets" {
  bucket = aws_s3_bucket.platform_assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = var.kms_key_arn != null ? "aws:kms" : "AES256"
      kms_master_key_id = var.kms_key_arn
    }
    bucket_key_enabled = var.kms_key_arn != null ? true : false
  }
}

# Access Logging - Criar apenas quando logging_bucket é fornecido
resource "aws_s3_bucket_logging" "platform_assets" {
  count  = var.logging_bucket != null ? 1 : 0
  bucket = aws_s3_bucket.platform_assets.id

  target_bucket = var.logging_bucket
  target_prefix = "${var.bucket_name}/"
}


# Block Public Access (com exceção para bucket policies)
resource "aws_s3_bucket_public_access_block" "platform_assets" {
  bucket = aws_s3_bucket.platform_assets.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Bucket Policy - Criar apenas quando há statements adicionais
resource "aws_s3_bucket_policy" "platform_assets" {
  count  = length(var.additional_policy_statements) > 0 ? 1 : 0
  bucket = aws_s3_bucket.platform_assets.id

  policy = jsonencode({
    Version   = "2012-10-17"
    Statement = var.additional_policy_statements
  })
}

  
# Configuração CORS
resource "aws_s3_bucket_cors_configuration" "platform_assets" {
  bucket = aws_s3_bucket.platform_assets.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag", "Content-Length", "Content-Type"]
    max_age_seconds = 3000
  }
}

# Lifecycle Configuration para limpeza de uploads incompletos
