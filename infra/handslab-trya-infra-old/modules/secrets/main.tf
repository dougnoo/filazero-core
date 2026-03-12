locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# Generate random passwords for secrets that need new values
resource "random_password" "secrets" {
  for_each = var.secrets

  length  = 32
  special = true

  lifecycle {
    ignore_changes = all
  }
}

# Secrets Manager Secrets
resource "aws_secretsmanager_secret" "main" {
  for_each = var.secrets

  name        = "/${var.project_name}/${var.environment}/${each.key}"
  description = each.value.description

  recovery_window_in_days = 7

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-${each.key}"
    }
  )
}

# Secret Values - only created if secret is new
resource "aws_secretsmanager_secret_version" "main" {
  for_each = var.secrets

  secret_id     = aws_secretsmanager_secret.main[each.key].id
  secret_string = random_password.secrets[each.key].result

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# SSM Parameters
resource "aws_ssm_parameter" "main" {
  for_each = var.parameters

  name        = "/${var.project_name}/${var.environment}/${each.key}"
  description = each.value.description
  type        = lookup(each.value, "type", "String")
  value       = each.value.value != "" ? each.value.value : "placeholder"
  tier        = lookup(each.value, "tier", "Standard")

  tags = merge(
    var.tags,
    {
      Name = "${local.name_prefix}-${each.key}"
    }
  )

  lifecycle {
    ignore_changes = [value]
  }
}
