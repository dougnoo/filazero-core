locals {
  bucket_name = "${var.tenant_name}-assets-${var.environment}"

  default_tags = {
    Tenant      = var.tenant_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Purpose     = "tenant-assets"
  }
}

# S3 Bucket for Tenant Assets
resource "aws_s3_bucket" "tenant_assets" {
  bucket = local.bucket_name

  tags = merge(local.default_tags, var.tags)
}

# Public access block - allows public read if enabled
resource "aws_s3_bucket_public_access_block" "tenant_assets" {
  bucket = aws_s3_bucket.tenant_assets.id

  block_public_acls       = !var.enable_public_read
  block_public_policy     = !var.enable_public_read
  ignore_public_acls      = !var.enable_public_read
  restrict_public_buckets = !var.enable_public_read
}

# Enable versioning
resource "aws_s3_bucket_versioning" "tenant_assets" {
  count  = var.enable_versioning ? 1 : 0
  bucket = aws_s3_bucket.tenant_assets.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "tenant_assets" {
  bucket = aws_s3_bucket.tenant_assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Lifecycle rule
resource "aws_s3_bucket_lifecycle_configuration" "tenant_assets" {
  bucket = aws_s3_bucket.tenant_assets.id

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
resource "aws_s3_bucket_cors_configuration" "tenant_assets" {
  bucket = aws_s3_bucket.tenant_assets.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = var.cors_allowed_origins
    expose_headers  = ["ETag", "Content-Length", "Content-Type"]
    max_age_seconds = 3600
  }
}

# Bucket policy - combines public read (if enabled) and ECS role access
resource "aws_s3_bucket_policy" "tenant_assets" {
  bucket = aws_s3_bucket.tenant_assets.id

  depends_on = [aws_s3_bucket_public_access_block.tenant_assets]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      # Public read access for assets (when enabled)
      var.enable_public_read ? [
        {
          Sid       = "PublicReadGetObject"
          Effect    = "Allow"
          Principal = "*"
          Action    = "s3:GetObject"
          Resource  = "${aws_s3_bucket.tenant_assets.arn}/*"
        }
      ] : [],
      # ECS Task Roles access (when specified)
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
            aws_s3_bucket.tenant_assets.arn,
            "${aws_s3_bucket.tenant_assets.arn}/*"
          ]
        }
      ] : [],
      # CloudFront OAC access (when specified)
      var.cloudfront_distribution_arn != "" ? [
        {
          Sid    = "CloudFrontOACAccess"
          Effect = "Allow"
          Principal = {
            Service = "cloudfront.amazonaws.com"
          }
          Action   = "s3:GetObject"
          Resource = "${aws_s3_bucket.tenant_assets.arn}/*"
          Condition = {
            StringEquals = {
              "AWS:SourceArn" = var.cloudfront_distribution_arn
            }
          }
        }
      ] : []
    )
  })
}

# =============================================================================
# IAM Policy for ECS Tasks to access this bucket
# =============================================================================
# This policy can be attached to ECS task roles that need access to this bucket

resource "aws_iam_policy" "bucket_access" {
  count = var.create_iam_policy ? 1 : 0

  name        = "${local.bucket_name}-access-policy"
  description = "IAM policy for accessing ${local.bucket_name} S3 bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3BucketAccess"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.tenant_assets.arn}/*"
      },
      {
        Sid    = "S3BucketListAccess"
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = aws_s3_bucket.tenant_assets.arn
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
