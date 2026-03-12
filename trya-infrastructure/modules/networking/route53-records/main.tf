# A Record (ou AAAA para IPv6)
resource "aws_route53_record" "this" {
  for_each = { for record in var.records : "${record.name}-${record.type}" => record }

  zone_id = var.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = lookup(each.value, "ttl", null)

  # Simple routing
  records = lookup(each.value, "records", null)

  # Alias routing (para ALB, CloudFront, etc)
  dynamic "alias" {
    for_each = lookup(each.value, "alias", null) != null ? [each.value.alias] : []
    content {
      name                   = alias.value.name
      zone_id                = alias.value.zone_id
      evaluate_target_health = lookup(alias.value, "evaluate_target_health", false)
    }
  }

  # Weighted routing (apenas se weight E set_identifier estiverem definidos)
  dynamic "weighted_routing_policy" {
    for_each = lookup(each.value, "weight", null) != null && lookup(each.value, "set_identifier", null) != null ? [1] : []
    content {
      weight = each.value.weight
    }
  }

  # Geolocation routing (apenas se geolocation E set_identifier estiverem definidos)
  dynamic "geolocation_routing_policy" {
    for_each = lookup(each.value, "geolocation", null) != null && lookup(each.value, "set_identifier", null) != null ? [each.value.geolocation] : []
    content {
      continent   = lookup(geolocation_routing_policy.value, "continent", null)
      country     = lookup(geolocation_routing_policy.value, "country", null)
      subdivision = lookup(geolocation_routing_policy.value, "subdivision", null)
    }
  }

  # Failover routing (apenas se failover E set_identifier estiverem definidos)
  dynamic "failover_routing_policy" {
    for_each = lookup(each.value, "failover", null) != null && lookup(each.value, "set_identifier", null) != null ? [1] : []
    content {
      type = each.value.failover
    }
  }

  # Set identifier (apenas para routing policies avançadas)
  set_identifier  = lookup(each.value, "set_identifier", null)
  health_check_id = lookup(each.value, "health_check_id", null)
}
