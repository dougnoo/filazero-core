# ─── FilaZero Production Environment ───────────────────────
# Root terragrunt config for production

terraform {
  extra_arguments "common_vars" {
    commands = get_terraform_commands_that_need_vars()

    arguments = [
      "-var-file=${get_terragrunt_dir()}/common.tfvars"
    ]
  }
}

remote_state {
  backend = "s3"
  config = {
    bucket         = "filazero-terraform-state-prod"
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = "sa-east-1"
    encrypt        = true
    dynamodb_table = "filazero-terraform-locks"
  }
}

inputs = {
  environment     = "production"
  project_name    = "filazero"
  aws_region      = "sa-east-1"
  
  # Multi-tenancy: each municipality = one tenant
  # Configured per-deployment via tfvars
}
