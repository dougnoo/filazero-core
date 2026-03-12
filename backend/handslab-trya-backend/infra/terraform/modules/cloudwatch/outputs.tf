output "dashboard_arn" {
  description = "ARN of the CloudWatch dashboard"
  value       = aws_cloudwatch_dashboard.this.dashboard_arn
}

output "dashboard_name" {
  description = "Name of the CloudWatch dashboard"
  value       = aws_cloudwatch_dashboard.this.dashboard_name
}

output "sns_topic_arn" {
  description = "ARN of the SNS topic for alarms"
  value       = var.create_sns_topic ? aws_sns_topic.alarms[0].arn : null
}

output "alarm_arns" {
  description = "ARNs of CloudWatch alarms"
  value = {
    ecs_cpu_high      = var.create_alarms ? aws_cloudwatch_metric_alarm.ecs_cpu_high[0].arn : null
    ecs_memory_high   = var.create_alarms ? aws_cloudwatch_metric_alarm.ecs_memory_high[0].arn : null
    alb_5xx_errors    = var.create_alarms && var.alb_arn_suffix != null ? aws_cloudwatch_metric_alarm.alb_5xx_errors[0].arn : null
    alb_response_time = var.create_alarms && var.alb_arn_suffix != null ? aws_cloudwatch_metric_alarm.alb_response_time[0].arn : null
  }
}

