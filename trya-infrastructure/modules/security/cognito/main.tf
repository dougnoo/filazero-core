# =============================================================================
# Cognito User Pool Module
# =============================================================================

resource "aws_cognito_user_pool" "this" {
  name = var.pool_name

  # Password Policy
  password_policy {
    minimum_length                   = var.password_minimum_length
    require_lowercase                = var.password_require_lowercase
    require_uppercase                = var.password_require_uppercase
    require_numbers                  = var.password_require_numbers
    require_symbols                  = var.password_require_symbols
    temporary_password_validity_days = var.temporary_password_validity_days
  }

  # MFA Configuration
  mfa_configuration = var.mfa_configuration

  # Email Configuration
  email_configuration {
    email_sending_account = var.ses_email_identity != null ? "DEVELOPER" : "COGNITO_DEFAULT"
    source_arn            = var.ses_email_identity
    from_email_address    = var.from_email_address
  }

  # SMS Configuration
  dynamic "sms_configuration" {
    for_each = var.sns_caller_arn != null ? [1] : []
    content {
      external_id    = var.sns_external_id
      sns_caller_arn = var.sns_caller_arn
      sns_region     = var.sns_region
    }
  }

  # Account Recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Auto-verified attributes
  auto_verified_attributes = var.auto_verified_attributes

  # Standard attributes
  schema {
    name                = "email"
    attribute_data_type = "String"
    mutable             = true
    required            = true
    
    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    mutable             = true
    required            = true
    
    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    name                = "phone_number"
    attribute_data_type = "String"
    mutable             = true
    required            = false
    
    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  # Custom attributes
  dynamic "schema" {
    for_each = var.custom_attributes
    content {
      name                = schema.value.name
      attribute_data_type = schema.value.type
      mutable             = lookup(schema.value, "mutable", true)
      required            = lookup(schema.value, "required", false)
      
      dynamic "string_attribute_constraints" {
        for_each = schema.value.type == "String" ? [1] : []
        content {
          min_length = lookup(schema.value, "min_length", 1)
          max_length = lookup(schema.value, "max_length", 256)
        }
      }
    }
  }

  tags = var.tags
}

# User Pool Client
resource "aws_cognito_user_pool_client" "this" {
  count = var.create_client ? 1 : 0

  name         = "${var.pool_name}-client"
  user_pool_id = aws_cognito_user_pool.this.id

  generate_secret = var.generate_client_secret

  # Explicit Auth Flows
  explicit_auth_flows = var.explicit_auth_flows

  # OAuth
  allowed_oauth_flows                  = var.allowed_oauth_flows
  allowed_oauth_scopes                 = var.allowed_oauth_scopes
  allowed_oauth_flows_user_pool_client = length(var.allowed_oauth_flows) > 0
  supported_identity_providers         = var.supported_identity_providers

  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls

  # Token validity
  access_token_validity  = var.access_token_validity
  id_token_validity      = var.id_token_validity
  refresh_token_validity = var.refresh_token_validity

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  # Prevent user existence errors
  prevent_user_existence_errors = "ENABLED"

  # Read/Write attributes
  read_attributes  = var.read_attributes
  write_attributes = var.write_attributes

  # Enable token revocation
  enable_token_revocation = true
}

# User Pool Domain
resource "aws_cognito_user_pool_domain" "this" {
  count = var.domain != null ? 1 : 0

  domain       = var.domain
  user_pool_id = aws_cognito_user_pool.this.id
}

# User Pool Groups
resource "aws_cognito_user_group" "groups" {
  for_each = var.user_groups

  name         = each.key
  user_pool_id = aws_cognito_user_pool.this.id
  description  = lookup(each.value, "description", null)
  precedence   = lookup(each.value, "precedence", null)
  role_arn     = lookup(each.value, "role_arn", null)
}
