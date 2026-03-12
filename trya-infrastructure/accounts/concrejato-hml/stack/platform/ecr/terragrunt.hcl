# =============================================================================
# Platform ECR Repository Configuration
# =============================================================================

terraform {
  source = "../../../../../modules/compute/ecr"
}

include "root" {
  path = find_in_parent_folders()
}

inputs = {
  repository_name      = "${local.account_vars.locals.account_name}-platform"
  image_tag_mutability = "MUTABLE"
  scan_on_push         = true
  max_image_count      = 15
  
  tags = {
    Name    = "${local.account_vars.locals.account_name}-platform"
    Service = "platform"
  }
}

locals {
  account_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
}
