# ─── FilaZero DynamoDB Module ──────────────────────────────
# NoSQL tables for tenant API (trya-backend), clinical sessions, chat history

variable "project_name" { type = string }
variable "environment" { type = string }

variable "billing_mode" {
  type    = string
  default = "PAY_PER_REQUEST"
}

# ─── Clinical Intake Sessions ─────────────────────────────
resource "aws_dynamodb_table" "intake_sessions" {
  name         = "${var.project_name}-${var.environment}-intake-sessions"
  billing_mode = var.billing_mode
  hash_key     = "session_id"
  range_key    = "municipality_id"

  attribute {
    name = "session_id"
    type = "S"
  }

  attribute {
    name = "municipality_id"
    type = "S"
  }

  attribute {
    name = "citizen_cpf"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "S"
  }

  global_secondary_index {
    name            = "by-municipality"
    hash_key        = "municipality_id"
    range_key       = "created_at"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "by-citizen"
    hash_key        = "citizen_cpf"
    range_key       = "created_at"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# ─── Chat History ─────────────────────────────────────────
resource "aws_dynamodb_table" "chat_history" {
  name         = "${var.project_name}-${var.environment}-chat-history"
  billing_mode = var.billing_mode
  hash_key     = "session_id"
  range_key    = "message_id"

  attribute {
    name = "session_id"
    type = "S"
  }

  attribute {
    name = "message_id"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# ─── Triage Queue ─────────────────────────────────────────
resource "aws_dynamodb_table" "triage_queue" {
  name         = "${var.project_name}-${var.environment}-triage-queue"
  billing_mode = var.billing_mode
  hash_key     = "municipality_id"
  range_key    = "priority_score"

  attribute {
    name = "municipality_id"
    type = "S"
  }

  attribute {
    name = "priority_score"
    type = "N"
  }

  attribute {
    name = "specialty"
    type = "S"
  }

  global_secondary_index {
    name            = "by-specialty"
    hash_key        = "municipality_id"
    range_key       = "specialty"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# ─── Care Journeys ────────────────────────────────────────
resource "aws_dynamodb_table" "care_journeys" {
  name         = "${var.project_name}-${var.environment}-care-journeys"
  billing_mode = var.billing_mode
  hash_key     = "journey_id"
  range_key    = "citizen_cpf"

  attribute {
    name = "journey_id"
    type = "S"
  }

  attribute {
    name = "citizen_cpf"
    type = "S"
  }

  attribute {
    name = "municipality_id"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  global_secondary_index {
    name            = "by-municipality-status"
    hash_key        = "municipality_id"
    range_key       = "status"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "by-citizen"
    hash_key        = "citizen_cpf"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# ─── Outputs ──────────────────────────────────────────────
output "intake_sessions_table_name" {
  value = aws_dynamodb_table.intake_sessions.name
}

output "chat_history_table_name" {
  value = aws_dynamodb_table.chat_history.name
}

output "triage_queue_table_name" {
  value = aws_dynamodb_table.triage_queue.name
}

output "care_journeys_table_name" {
  value = aws_dynamodb_table.care_journeys.name
}
