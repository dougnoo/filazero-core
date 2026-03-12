# =============================================================================
# IAM Role for Cross-Account Route53 Access
# =============================================================================

# Trust policy para permitir que outras contas assumam esta role
data "aws_iam_policy_document" "trust_policy" {
  statement {
    effect = "Allow"
    
    principals {
      type        = "AWS"
      identifiers = [for account_id in var.trusted_account_ids : "arn:aws:iam::${account_id}:root"]
    }
    
    actions = ["sts:AssumeRole"]
    
    condition {
      test     = "StringEquals"
      variable = "sts:ExternalId"
      values   = ["acm-dns-validation"]
    }
  }
}

# Policy para operações no Route53
data "aws_iam_policy_document" "route53_policy" {
  statement {
    effect = "Allow"
    
    actions = [
      "route53:GetChange",
      "route53:GetHostedZone",
      "route53:ListHostedZones",
      "route53:ListResourceRecordSets"
    ]
    
    resources = ["*"]
  }
  
  statement {
    effect = "Allow"
    
    actions = [
      "route53:ChangeResourceRecordSets"
    ]
    
    resources = var.route53_zone_arns
  }
}

# IAM Role
resource "aws_iam_role" "this" {
  name               = var.role_name
  assume_role_policy = data.aws_iam_policy_document.trust_policy.json
  
  tags = merge(
    var.tags,
    {
      Name        = var.role_name
      Purpose     = "ACM DNS Validation Cross-Account"
      ManagedBy   = "Terraform"
    }
  )
}

# IAM Policy
resource "aws_iam_policy" "route53_access" {
  name        = "${var.role_name}-Route53Access"
  description = "Policy for cross-account Route53 access for ACM validation"
  policy      = data.aws_iam_policy_document.route53_policy.json
  
  tags = var.tags
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "route53_access" {
  role       = aws_iam_role.this.name
  policy_arn = aws_iam_policy.route53_access.arn
}