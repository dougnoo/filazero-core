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
      sse_algorithm = "AES256"
    }
  }
}

# Block Public Access (com exceção para bucket policies)
resource "aws_s3_bucket_public_access_block" "platform_assets" {
  bucket = aws_s3_bucket.platform_assets.id

  block_public_acls       = true
  block_public_policy     = false  # Permite bucket policy para fotos públicas
  ignore_public_acls      = true
  restrict_public_buckets = false  # Permite bucket policy para fotos públicas
}

# Bucket Policy para tornar fotos de perfil públicas
resource "aws_s3_bucket_policy" "platform_assets" {
  bucket = aws_s3_bucket.platform_assets.id
  depends_on = [aws_s3_bucket_public_access_block.platform_assets]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadProfilePictures"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.platform_assets.arn}/profile-pictures/*"
      }
    ]
  })
}

# Configuração CORS
resource "aws_s3_bucket_cors_configuration" "platform_assets" {
  bucket = aws_s3_bucket.platform_assets.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST"]
    allowed_origins = var.cors_allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
    expose_headers  = []
    max_age_seconds = 3000
  }
}

# Lifecycle Configuration para limpeza de uploads incompletos
resource "aws_s3_bucket_lifecycle_configuration" "platform_assets" {
  bucket = aws_s3_bucket.platform_assets.id

  rule {
    id     = "cleanup_incomplete_uploads"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }

  rule {
    id     = "cleanup_old_versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}