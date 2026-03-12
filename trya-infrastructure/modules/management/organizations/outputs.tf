output "organization_id" {
  description = "The organization ID"
  value       = var.create_organization ? aws_organizations_organization.this[0].id : null
}

output "organization_arn" {
  description = "The organization ARN"
  value       = var.create_organization ? aws_organizations_organization.this[0].arn : null
}

output "organization_root_id" {
  description = "The root ID of the organization"
  value       = var.create_organization ? aws_organizations_organization.this[0].roots[0].id : var.root_id
}

output "organizational_units" {
  description = "Map of OU names to their IDs"
  value = {
    for k, v in aws_organizations_organizational_unit.this : k => {
      id   = v.id
      arn  = v.arn
      name = v.name
    }
  }
}

output "accounts" {
  description = "Map of account names to their details"
  value = {
    for k, v in aws_organizations_account.this : k => {
      id    = v.id
      arn   = v.arn
      email = v.email
      name  = v.name
    }
  }
}

output "scp_ids" {
  description = "Map of SCP names to their IDs"
  value = {
    for k, v in aws_organizations_policy.scp : k => v.id
  }
}
