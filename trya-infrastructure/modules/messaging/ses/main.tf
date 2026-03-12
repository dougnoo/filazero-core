# =============================================================================
# SES Module with Cross-Account Route53 Integration
# =============================================================================

# Domain Identity
resource "aws_ses_domain_identity" "this" {
  count = var.domain != null ? 1 : 0

  domain = var.domain
}

# Domain DKIM
resource "aws_ses_domain_dkim" "this" {
  count = var.domain != null && var.enable_dkim ? 1 : 0

  domain = aws_ses_domain_identity.this[0].domain
}

# Email Identity
resource "aws_ses_email_identity" "this" {
  for_each = toset(var.email_identities)

  email = each.value
}

# Route53 Record for Domain Verification (Cross-Account)
resource "aws_route53_record" "ses_verification" {
  count = var.domain != null && var.route53_zone_id != null ? 1 : 0

  provider = aws.dns
  zone_id  = var.route53_zone_id
  name     = "_amazonses.${var.domain}"
  type     = "TXT"
  ttl      = 300
  records  = [aws_ses_domain_identity.this[0].verification_token]
}

# Route53 Records for DKIM (Cross-Account)
resource "aws_route53_record" "ses_dkim" {
  count = var.domain != null && var.enable_dkim && var.route53_zone_id != null ? 3 : 0

  provider = aws.dns
  zone_id  = var.route53_zone_id
  name     = "${aws_ses_domain_dkim.this[0].dkim_tokens[count.index]}._domainkey.${var.domain}"
  type     = "CNAME"
  ttl      = 300
  records  = ["${aws_ses_domain_dkim.this[0].dkim_tokens[count.index]}.dkim.amazonses.com"]
}

# Configuration Set
resource "aws_ses_configuration_set" "this" {
  count = var.create_configuration_set ? 1 : 0

  name = var.configuration_set_name

  delivery_options {
    tls_policy = var.tls_policy
  }
}

# Event Destination (CloudWatch) - Desabilitado temporariamente
# resource "aws_ses_event_destination" "cloudwatch" {
#   count = var.create_configuration_set && var.enable_cloudwatch_destination ? 1 : 0
#
#   name                   = "${var.configuration_set_name}-cloudwatch"
#   configuration_set_name = aws_ses_configuration_set.this[0].name
#   enabled                = true
#   matching_types         = var.cloudwatch_event_types
#
#   cloudwatch_destination {
#     dimension_name         = "MessageTag"
#     dimension_value_source = "messageTag"
#     default_value          = "default"
#   }
#
#   cloudwatch_destination {
#     dimension_name         = "ConfigurationSet"
#     dimension_value_source = "linkTag"
#     default_value          = var.configuration_set_name
#   }
# }

# IAM Policy for Cognito
resource "aws_iam_policy" "cognito_ses" {
  count = var.create_cognito_policy ? 1 : 0

  name        = "${var.configuration_set_name}-cognito-ses"
  description = "Allow Cognito to send emails via SES"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ]
      Resource = var.domain != null ? aws_ses_domain_identity.this[0].arn : "*"
    }]
  })
}
