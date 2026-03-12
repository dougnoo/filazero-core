# AWS Organization
resource "aws_organizations_organization" "this" {
  count = var.create_organization ? 1 : 0

  aws_service_access_principals = var.aws_service_access_principals
  enabled_policy_types          = var.enabled_policy_types
  feature_set                   = "ALL"
}

# Organizational Units
resource "aws_organizations_organizational_unit" "this" {
  for_each = var.organizational_units

  name      = each.value.name
  parent_id = each.value.parent_id != null ? each.value.parent_id : (var.create_organization ? aws_organizations_organization.this[0].roots[0].id : var.root_id)

  tags = merge(
    var.tags,
    lookup(each.value, "tags", {})
  )
}

# AWS Accounts
resource "aws_organizations_account" "this" {
  for_each = var.accounts

  name                       = each.value.name
  email                      = each.value.email
  parent_id                  = lookup(each.value, "parent_id", null) != null ? each.value.parent_id : (var.create_organization ? aws_organizations_organization.this[0].roots[0].id : var.root_id)
  role_name                  = lookup(each.value, "role_name", "OrganizationAccountAccessRole")
  iam_user_access_to_billing = lookup(each.value, "iam_user_access_to_billing", "ALLOW")
  close_on_deletion          = lookup(each.value, "close_on_deletion", false)

  tags = merge(
    var.tags,
    lookup(each.value, "tags", {})
  )

  lifecycle {
    ignore_changes = [role_name]
  }
}

# Service Control Policies (SCPs)
resource "aws_organizations_policy" "scp" {
  for_each = var.service_control_policies

  name        = each.value.name
  description = lookup(each.value, "description", "")
  type        = "SERVICE_CONTROL_POLICY"
  content     = each.value.content

  tags = merge(
    var.tags,
    lookup(each.value, "tags", {})
  )
}

# Attach SCPs to OUs or Accounts
resource "aws_organizations_policy_attachment" "scp" {
  for_each = var.scp_attachments

  policy_id = aws_organizations_policy.scp[each.value.policy_key].id
  target_id = each.value.target_id
}
