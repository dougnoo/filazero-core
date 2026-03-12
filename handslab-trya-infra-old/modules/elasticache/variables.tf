# ==============================================================================
# ElastiCache Module Variables
# ==============================================================================

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "cache_name" {
  description = "Name of the cache cluster"
  type        = string
}

variable "description" {
  description = "Description of the cache"
  type        = string
  default     = ""
}

variable "engine" {
  description = "Cache engine (redis, valkey, memcached)"
  type        = string
  default     = "valkey"
}

variable "engine_version" {
  description = "Engine version (for non-serverless)"
  type        = string
  default     = "7.0"
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs"
  type        = list(string)
}

variable "security_group_ids" {
  description = "List of security group IDs"
  type        = list(string)
}

# Serverless configuration
variable "use_serverless" {
  description = "Use ElastiCache Serverless"
  type        = bool
  default     = true
}

variable "serverless_max_data_storage_gb" {
  description = "Maximum data storage in GB for serverless"
  type        = number
  default     = 5
}

variable "serverless_max_ecpu_per_second" {
  description = "Maximum ECPU per second for serverless"
  type        = number
  default     = 5000
}

# Traditional cluster configuration
variable "node_type" {
  description = "Node type for the cache cluster"
  type        = string
  default     = "cache.t3.micro"
}

variable "num_cache_clusters" {
  description = "Number of cache clusters (nodes)"
  type        = number
  default     = 1
}

variable "port" {
  description = "Port for the cache"
  type        = number
  default     = 6379
}

variable "parameter_group_name" {
  description = "Name of the parameter group"
  type        = string
  default     = null
}

variable "automatic_failover_enabled" {
  description = "Enable automatic failover"
  type        = bool
  default     = false
}

variable "multi_az_enabled" {
  description = "Enable Multi-AZ"
  type        = bool
  default     = false
}

variable "at_rest_encryption_enabled" {
  description = "Enable at-rest encryption"
  type        = bool
  default     = true
}

variable "transit_encryption_enabled" {
  description = "Enable transit encryption"
  type        = bool
  default     = true
}

# Snapshot configuration
variable "snapshot_retention_limit" {
  description = "Number of days to retain snapshots"
  type        = number
  default     = 0
}

variable "snapshot_window" {
  description = "Snapshot window (e.g., 05:00-09:00)"
  type        = string
  default     = "05:00-09:00"
}

variable "daily_snapshot_time" {
  description = "Daily snapshot time for serverless (e.g., 05:00)"
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
