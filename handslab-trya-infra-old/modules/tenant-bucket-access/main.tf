# =============================================================================
# Tenant Bucket Access Module
# =============================================================================
# Este módulo cria IAM policies consolidadas para acesso a buckets de tenant.
#
# Uso:
#   - Cria uma policy que dá acesso a todos os buckets de tenant de um ambiente
#   - Pode ser anexada a roles de ECS tasks
#   - Segue o princípio de menor privilégio
# =============================================================================

locals {
  policy_name = "trya-tenant-buckets-${var.environment}-access"

  # Gera ARNs dos buckets baseado nos tenants conhecidos
  bucket_arns = [
    for tenant in var.tenant_names : "arn:aws:s3:::${tenant}-assets-${var.environment}"
  ]

  bucket_object_arns = [
    for tenant in var.tenant_names : "arn:aws:s3:::${tenant}-assets-${var.environment}/*"
  ]
}

# =============================================================================
# IAM Policy - Acesso de Leitura a Todos os Buckets de Tenant
# =============================================================================

resource "aws_iam_policy" "tenant_buckets_read" {
  name        = "${local.policy_name}-read"
  description = "Read-only access to all tenant asset buckets in ${var.environment}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ListTenantBuckets"
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = local.bucket_arns
      },
      {
        Sid    = "ReadTenantObjects"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetObjectTagging"
        ]
        Resource = local.bucket_object_arns
      }
    ]
  })

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Purpose     = "tenant-bucket-read-access"
  }
}

# =============================================================================
# IAM Policy - Acesso de Escrita a Todos os Buckets de Tenant
# =============================================================================

resource "aws_iam_policy" "tenant_buckets_write" {
  count = var.create_write_policy ? 1 : 0

  name        = "${local.policy_name}-write"
  description = "Read/Write access to all tenant asset buckets in ${var.environment}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ListTenantBuckets"
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = local.bucket_arns
      },
      {
        Sid    = "ReadWriteTenantObjects"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetObjectTagging",
          "s3:PutObject",
          "s3:PutObjectTagging",
          "s3:DeleteObject",
          "s3:DeleteObjectVersion"
        ]
        Resource = local.bucket_object_arns
      }
    ]
  })

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Purpose     = "tenant-bucket-write-access"
  }
}

# =============================================================================
# Policy Attachments
# =============================================================================

# Attach read policy to specified roles
resource "aws_iam_role_policy_attachment" "read_access" {
  count = length(var.read_access_role_names)

  role       = var.read_access_role_names[count.index]
  policy_arn = aws_iam_policy.tenant_buckets_read.arn
}

# Attach write policy to specified roles
resource "aws_iam_role_policy_attachment" "write_access" {
  count = var.create_write_policy ? length(var.write_access_role_names) : 0

  role       = var.write_access_role_names[count.index]
  policy_arn = aws_iam_policy.tenant_buckets_write[0].arn
}
