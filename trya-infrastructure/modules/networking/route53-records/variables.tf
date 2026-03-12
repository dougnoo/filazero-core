variable "zone_id" {
  description = "Route53 hosted zone ID"
  type        = string
}

variable "records" {
  description = "List of DNS records to create"
  type = list(object({
    name    = string
    type    = string
    ttl     = optional(number)
    records = optional(list(string))
    alias = optional(object({
      name                   = string
      zone_id                = string
      evaluate_target_health = optional(bool)
    }))
    weight          = optional(number)
    set_identifier  = optional(string)
    health_check_id = optional(string)
    failover        = optional(string) # PRIMARY or SECONDARY
    geolocation = optional(object({
      continent   = optional(string)
      country     = optional(string)
      subdivision = optional(string)
    }))
  }))
  default = []
}
