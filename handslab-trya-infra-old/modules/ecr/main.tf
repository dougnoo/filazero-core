locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# ECR Repositories
resource "aws_ecr_repository" "main" {
  for_each = { for repo in var.repositories : repo.name => repo }

  name                 = "${lower(var.project_name)}-${var.environment}-${each.value.name}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = each.value.scan_on_push
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-${each.value.name}"
    }
  )
}

# Lifecycle Policy
resource "aws_ecr_lifecycle_policy" "main" {
  for_each   = { for repo in var.repositories : repo.name => repo }
  repository = aws_ecr_repository.main[each.key].name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# Repository Policy - Allow pull from ECS
resource "aws_ecr_repository_policy" "main" {
  for_each   = { for repo in var.repositories : repo.name => repo }
  repository = aws_ecr_repository.main[each.key].name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPull"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability"
        ]
      }
    ]
  })
}
