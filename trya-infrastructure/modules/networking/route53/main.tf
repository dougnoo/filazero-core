# Route53 Hosted Zone
resource "aws_route53_zone" "this" {
  name    = var.domain_name
  comment = var.comment

  tags = var.tags
}

# Health Check (opcional)
resource "aws_route53_health_check" "this" {
  count = var.enable_health_check ? 1 : 0

  fqdn              = var.health_check_fqdn
  port              = var.health_check_port
  type              = var.health_check_type
  resource_path     = var.health_check_path
  failure_threshold = var.health_check_failure_threshold
  request_interval  = var.health_check_interval

  tags = merge(
    var.tags,
    {
      Name = "${var.domain_name}-health-check"
    }
  )
}

# CloudWatch Alarm para Health Check
resource "aws_cloudwatch_metric_alarm" "health_check" {
  count = var.enable_health_check ? 1 : 0

  alarm_name          = "${var.domain_name}-health-check-failed"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HealthCheckStatus"
  namespace           = "AWS/Route53"
  period              = "60"
  statistic           = "Minimum"
  threshold           = "1"
  alarm_description   = "Health check failed for ${var.domain_name}"
  alarm_actions       = var.alarm_actions

  dimensions = {
    HealthCheckId = aws_route53_health_check.this[0].id
  }

  tags = var.tags
}
