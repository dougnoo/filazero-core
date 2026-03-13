# ─── FilaZero Cognito Module ───────────────────────────────
# Authentication for Citizens (CPF/OTP), Professionals, Managers, Admins

variable "project_name" { type = string }
variable "environment" { type = string }
variable "domain_name" { type = string }

variable "cognito_password_min_length" {
  type    = number
  default = 8
}

variable "cognito_mfa_enabled" {
  type    = bool
  default = true
}

# ─── User Pool ────────────────────────────────────────────
resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-${var.environment}"

  # Username = email for professionals, CPF for citizens
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = var.cognito_password_min_length
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  mfa_configuration = var.cognito_mfa_enabled ? "OPTIONAL" : "OFF"

  dynamic "software_token_mfa_configuration" {
    for_each = var.cognito_mfa_enabled ? [1] : []
    content {
      enabled = true
    }
  }

  # Custom attributes for multi-tenancy and RBAC
  schema {
    name                = "role"
    attribute_data_type = "String"
    mutable             = true
    string_attribute_constraints {
      min_length = 1
      max_length = 50
    }
  }

  schema {
    name                = "municipality_id"
    attribute_data_type = "String"
    mutable             = true
    string_attribute_constraints {
      min_length = 0
      max_length = 36
    }
  }

  schema {
    name                = "unit_id"
    attribute_data_type = "String"
    mutable             = true
    string_attribute_constraints {
      min_length = 0
      max_length = 36
    }
  }

  schema {
    name                = "cpf"
    attribute_data_type = "String"
    mutable             = false
    string_attribute_constraints {
      min_length = 11
      max_length = 11
    }
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
    recovery_mechanism {
      name     = "verified_phone_number"
      priority = 2
    }
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# ─── User Pool Groups (Roles) ─────────────────────────────
resource "aws_cognito_user_group" "citizen" {
  user_pool_id = aws_cognito_user_pool.main.id
  name         = "citizen"
  description  = "Citizens using the public health system"
}

resource "aws_cognito_user_group" "professional" {
  user_pool_id = aws_cognito_user_pool.main.id
  name         = "professional"
  description  = "Health professionals (doctors, nurses)"
}

resource "aws_cognito_user_group" "manager" {
  user_pool_id = aws_cognito_user_pool.main.id
  name         = "manager"
  description  = "Health unit and municipal managers"
}

resource "aws_cognito_user_group" "admin" {
  user_pool_id = aws_cognito_user_pool.main.id
  name         = "admin"
  description  = "System administrators"
}

# ─── App Clients ──────────────────────────────────────────
resource "aws_cognito_user_pool_client" "web" {
  name         = "${var.project_name}-${var.environment}-web"
  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_CUSTOM_AUTH",
  ]

  supported_identity_providers = ["COGNITO"]

  callback_urls = [
    "https://${var.domain_name}",
    "https://${var.domain_name}/login/callback",
    "http://localhost:5173",
    "http://localhost:5173/login/callback",
  ]

  logout_urls = [
    "https://${var.domain_name}",
    "http://localhost:5173",
  ]

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 30

  read_attributes  = ["email", "custom:role", "custom:municipality_id", "custom:unit_id", "custom:cpf"]
  write_attributes = ["email"]
}

resource "aws_cognito_user_pool_client" "api" {
  name         = "${var.project_name}-${var.environment}-api"
  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ALLOW_ADMIN_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  generate_secret = true
}

# ─── Outputs ──────────────────────────────────────────────
output "user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "user_pool_arn" {
  value = aws_cognito_user_pool.main.arn
}

output "web_client_id" {
  value = aws_cognito_user_pool_client.web.id
}

output "api_client_id" {
  value = aws_cognito_user_pool_client.api.id
}
