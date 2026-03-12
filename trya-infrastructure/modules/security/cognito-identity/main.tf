# =============================================================================
# Cognito Identity Pool Module
# =============================================================================

# Cognito Identity Pool
resource "aws_cognito_identity_pool" "this" {
  identity_pool_name               = var.identity_pool_name
  allow_unauthenticated_identities = var.allow_unauthenticated_identities
  allow_classic_flow               = var.allow_classic_flow

  # Cognito Identity Providers
  dynamic "cognito_identity_providers" {
    for_each = var.cognito_identity_providers
    content {
      client_id               = cognito_identity_providers.value.client_id
      provider_name           = cognito_identity_providers.value.provider_name
      server_side_token_check = lookup(cognito_identity_providers.value, "server_side_token_check", false)
    }
  }

  # SAML Identity Providers
  dynamic "saml_provider_arns" {
    for_each = var.saml_provider_arns
    content {
      saml_provider_arns = saml_provider_arns.value
    }
  }

  # OpenID Connect Providers
  dynamic "openid_connect_provider_arns" {
    for_each = var.openid_connect_provider_arns
    content {
      openid_connect_provider_arns = openid_connect_provider_arns.value
    }
  }

  # Supported Login Providers
  supported_login_providers = var.supported_login_providers

  tags = var.tags
}

# IAM Role for Authenticated Users
resource "aws_iam_role" "authenticated" {
  name = "${var.identity_pool_name}-authenticated-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.this.id
          }
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "authenticated"
          }
        }
      }
    ]
  })

  tags = var.tags
}

# IAM Role for Unauthenticated Users (if enabled)
resource "aws_iam_role" "unauthenticated" {
  count = var.allow_unauthenticated_identities ? 1 : 0
  name  = "${var.identity_pool_name}-unauthenticated-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.this.id
          }
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "unauthenticated"
          }
        }
      }
    ]
  })

  tags = var.tags
}

# Policy for Authenticated Users
resource "aws_iam_role_policy" "authenticated" {
  name = "${var.identity_pool_name}-authenticated-policy"
  role = aws_iam_role.authenticated.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      [
        {
          Effect = "Allow"
          Action = [
            "mobileanalytics:PutEvents",
            "cognito-sync:*",
            "cognito-identity:*"
          ]
          Resource = "*"
        }
      ],
      var.authenticated_policy_statements
    )
  })
}

# Policy for Unauthenticated Users (if enabled)
resource "aws_iam_role_policy" "unauthenticated" {
  count = var.allow_unauthenticated_identities ? 1 : 0
  name  = "${var.identity_pool_name}-unauthenticated-policy"
  role  = aws_iam_role.unauthenticated[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      [
        {
          Effect = "Allow"
          Action = [
            "mobileanalytics:PutEvents",
            "cognito-sync:*"
          ]
          Resource = "*"
        }
      ],
      var.unauthenticated_policy_statements
    )
  })
}

# Identity Pool Role Attachment
resource "aws_cognito_identity_pool_roles_attachment" "this" {
  identity_pool_id = aws_cognito_identity_pool.this.id

  roles = merge(
    {
      "authenticated" = aws_iam_role.authenticated.arn
    },
    var.allow_unauthenticated_identities ? {
      "unauthenticated" = aws_iam_role.unauthenticated[0].arn
    } : {}
  )

  # Role Mappings
  dynamic "role_mapping" {
    for_each = var.role_mappings
    content {
      identity_provider         = role_mapping.value.identity_provider
      ambiguous_role_resolution = lookup(role_mapping.value, "ambiguous_role_resolution", "AuthenticatedRole")
      type                      = lookup(role_mapping.value, "type", "Token")

      dynamic "mapping_rule" {
        for_each = lookup(role_mapping.value, "mapping_rules", [])
        content {
          claim      = mapping_rule.value.claim
          match_type = mapping_rule.value.match_type
          role_arn   = mapping_rule.value.role_arn
          value      = mapping_rule.value.value
        }
      }
    }
  }
}