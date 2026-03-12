# =============================================================================
# Platform Files Bucket
# =============================================================================
# Bucket S3 para arquivos gerados pela plataforma:
# - Fotos de perfil (profile-pictures/)
# - Uploads temporários
# - Outros arquivos de usuário
#
# Características:
# - Acesso público apenas para prefixos específicos (profile-pictures/)
# - Acesso privado para outros prefixos
# - CORS configurado para domínios da aplicação
# - Versionamento habilitado por padrão
# =============================================================================

locals {
  default_tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Purpose     = "platform-files"
  }
}

# S3 Bucket
resource "aws_s3_bucket" "platform_files" {
  bucket = var.bucket_name

  tags = merge(local.default_tags, var.tags)
}

# Public access block - disabled to allow selective public access via bucket policy
resource "aws_s3_bucket_public_access_block" "platform_files" {
  bucket = aws_s3_bucket.platform_files.id

  # Allow public access via bucket policy (for specific prefixes only)
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = false
  restrict_public_buckets = false
}

# Enable versioning
resource "aws_s3_bucket_versioning" "platform_files" {
  count  = var.enable_versioning ? 1 : 0
  bucket = aws_s3_bucket.platform_files.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "platform_files" {
  bucket = aws_s3_bucket.platform_files.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Lifecycle rule
resource "aws_s3_bucket_lifecycle_configuration" "platform_files" {
  bucket = aws_s3_bucket.platform_files.id

  rule {
    id     = "cleanup-old-versions"
    status = "Enabled"

    filter {
      prefix = ""
    }

    noncurrent_version_expiration {
      noncurrent_days = var.lifecycle_noncurrent_days
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
  }
}

# CORS Configuration for web access
resource "aws_s3_bucket_cors_configuration" "platform_files" {
  bucket = aws_s3_bucket.platform_files.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "HEAD"]
    allowed_origins = var.cors_allowed_origins
    expose_headers  = ["ETag", "Content-Length", "Content-Type"]
    max_age_seconds = 3600
  }
}

# Bucket policy - selective public read for specific prefixes + ECS access
resource "aws_s3_bucket_policy" "platform_files" {
  bucket = aws_s3_bucket.platform_files.id

  depends_on = [aws_s3_bucket_public_access_block.platform_files]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      # Public read access for specific prefixes (e.g., profile-pictures/)
      [
        for prefix in var.public_read_prefixes : {
          Sid       = "PublicRead${replace(title(replace(prefix, "/", "")), "-", "")}"
          Effect    = "Allow"
          Principal = "*"
          Action    = "s3:GetObject"
          Resource  = "${aws_s3_bucket.platform_files.arn}/${prefix}*"
        }
      ],
      # ECS Task Roles full access (when specified)
      length(var.ecs_task_role_arns) > 0 ? [
        {
          Sid    = "ECSTaskRoleAccess"
          Effect = "Allow"
          Principal = {
            AWS = var.ecs_task_role_arns
          }
          Action = [
            "s3:GetObject",
            "s3:PutObject",
            "s3:DeleteObject",
            "s3:ListBucket"
          ]
          Resource = [
            aws_s3_bucket.platform_files.arn,
            "${aws_s3_bucket.platform_files.arn}/*"
          ]
        }
      ] : []
    )
  })
}

# =============================================================================
# IAM Policy for ECS Tasks
# =============================================================================

resource "aws_iam_policy" "bucket_access" {
  count = var.create_iam_policy ? 1 : 0

  name        = "${var.bucket_name}-access-policy"
  description = "IAM policy for accessing ${var.bucket_name} S3 bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3ObjectAccess"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.platform_files.arn}/*"
      },
      {
        Sid    = "S3BucketAccess"
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = aws_s3_bucket.platform_files.arn
      }
    ]
  })

  tags = local.default_tags
}

# Attach policy to specified roles
resource "aws_iam_role_policy_attachment" "bucket_access" {
  count = var.create_iam_policy ? length(var.attach_policy_to_roles) : 0

  role       = var.attach_policy_to_roles[count.index]
  policy_arn = aws_iam_policy.bucket_access[0].arn
}
