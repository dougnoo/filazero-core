# ─── FilaZero ECR Module ───────────────────────────────────
# Container registries for backend services

variable "project_name" { type = string }
variable "environment" { type = string }

locals {
  repositories = [
    "platform-backend",
    "trya-backend",
    "chat-agents",
  ]
}

resource "aws_ecr_repository" "repos" {
  for_each = toset(local.repositories)

  name                 = "${var.project_name}-${var.environment}/${each.value}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
    Service     = each.value
  }
}

resource "aws_ecr_lifecycle_policy" "cleanup" {
  for_each   = toset(local.repositories)
  repository = aws_ecr_repository.repos[each.key].name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

output "repository_urls" {
  value = { for k, v in aws_ecr_repository.repos : k => v.repository_url }
}
