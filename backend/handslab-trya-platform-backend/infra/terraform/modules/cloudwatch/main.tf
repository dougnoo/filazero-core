# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "this" {
  dashboard_name = var.dashboard_name

  dashboard_body = jsonencode({
    widgets = concat(
      # ECS Metrics
      [
        {
          type   = "metric"
          x      = 0
          y      = 0
          width  = 12
          height = 6
          properties = {
            title  = "ECS Service - CPU & Memory"
            region = data.aws_region.current.name
            metrics = [
              ["AWS/ECS", "CPUUtilization", "ServiceName", var.ecs_service_name, "ClusterName", var.ecs_cluster_name],
              [".", "MemoryUtilization", ".", ".", ".", "."]
            ]
            period = 300
            stat   = "Average"
          }
        },
        {
          type   = "metric"
          x      = 12
          y      = 0
          width  = 12
          height = 6
          properties = {
            title  = "ECS Service - Running Tasks"
            region = data.aws_region.current.name
            metrics = [
              ["ECS/ContainerInsights", "RunningTaskCount", "ServiceName", var.ecs_service_name, "ClusterName", var.ecs_cluster_name],
              [".", "DesiredTaskCount", ".", ".", ".", "."]
            ]
            period = 300
            stat   = "Average"
          }
        }
      ],
      # ALB Metrics
      var.alb_arn_suffix != null ? [
        {
          type   = "metric"
          x      = 0
          y      = 6
          width  = 8
          height = 6
          properties = {
            title  = "ALB - Request Count"
            region = data.aws_region.current.name
            metrics = [
              ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.alb_arn_suffix]
            ]
            period = 60
            stat   = "Sum"
          }
        },
        {
          type   = "metric"
          x      = 8
          y      = 6
          width  = 8
          height = 6
          properties = {
            title  = "ALB - Response Time"
            region = data.aws_region.current.name
            metrics = [
              ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", var.alb_arn_suffix]
            ]
            period = 60
            stat   = "Average"
          }
        },
        {
          type   = "metric"
          x      = 16
          y      = 6
          width  = 8
          height = 6
          properties = {
            title  = "ALB - HTTP Errors"
            region = data.aws_region.current.name
            metrics = [
              ["AWS/ApplicationELB", "HTTPCode_Target_4XX_Count", "LoadBalancer", var.alb_arn_suffix],
              [".", "HTTPCode_Target_5XX_Count", ".", "."]
            ]
            period = 60
            stat   = "Sum"
          }
        }
      ] : [],
      # Aurora Metrics
      var.aurora_cluster_identifier != null ? [
        {
          type   = "metric"
          x      = 0
          y      = 12
          width  = 8
          height = 6
          properties = {
            title  = "Aurora - CPU & Memory"
            region = data.aws_region.current.name
            metrics = [
              ["AWS/RDS", "CPUUtilization", "DBClusterIdentifier", var.aurora_cluster_identifier],
              [".", "FreeableMemory", ".", "."]
            ]
            period = 300
            stat   = "Average"
          }
        },
        {
          type   = "metric"
          x      = 8
          y      = 12
          width  = 8
          height = 6
          properties = {
            title  = "Aurora - Connections"
            region = data.aws_region.current.name
            metrics = [
              ["AWS/RDS", "DatabaseConnections", "DBClusterIdentifier", var.aurora_cluster_identifier]
            ]
            period = 300
            stat   = "Average"
          }
        },
        {
          type   = "metric"
          x      = 16
          y      = 12
          width  = 8
          height = 6
          properties = {
            title  = "Aurora - Read/Write IOPS"
            region = data.aws_region.current.name
            metrics = [
              ["AWS/RDS", "ReadIOPS", "DBClusterIdentifier", var.aurora_cluster_identifier],
              [".", "WriteIOPS", ".", "."]
            ]
            period = 300
            stat   = "Average"
          }
        }
      ] : []
    )
  })
}

# SNS Topic for Alarms
resource "aws_sns_topic" "alarms" {
  count = var.create_sns_topic ? 1 : 0

  name = "${var.dashboard_name}-alarms"

  tags = var.tags
}

# ECS CPU Alarm
resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  count = var.create_alarms ? 1 : 0

  alarm_name          = "${var.ecs_service_name}-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = var.ecs_cpu_threshold
  alarm_description   = "ECS service CPU utilization is high"

  dimensions = {
    ServiceName = var.ecs_service_name
    ClusterName = var.ecs_cluster_name
  }

  alarm_actions = var.create_sns_topic ? [aws_sns_topic.alarms[0].arn] : var.alarm_actions
  ok_actions    = var.create_sns_topic ? [aws_sns_topic.alarms[0].arn] : var.ok_actions

  tags = var.tags
}

# ECS Memory Alarm
resource "aws_cloudwatch_metric_alarm" "ecs_memory_high" {
  count = var.create_alarms ? 1 : 0

  alarm_name          = "${var.ecs_service_name}-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = var.ecs_memory_threshold
  alarm_description   = "ECS service memory utilization is high"

  dimensions = {
    ServiceName = var.ecs_service_name
    ClusterName = var.ecs_cluster_name
  }

  alarm_actions = var.create_sns_topic ? [aws_sns_topic.alarms[0].arn] : var.alarm_actions
  ok_actions    = var.create_sns_topic ? [aws_sns_topic.alarms[0].arn] : var.ok_actions

  tags = var.tags
}

# ALB 5XX Errors Alarm
resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  count = var.create_alarms && var.alb_arn_suffix != null ? 1 : 0

  alarm_name          = "${var.dashboard_name}-alb-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = var.alb_5xx_threshold
  alarm_description   = "ALB 5XX errors are high"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  alarm_actions = var.create_sns_topic ? [aws_sns_topic.alarms[0].arn] : var.alarm_actions
  ok_actions    = var.create_sns_topic ? [aws_sns_topic.alarms[0].arn] : var.ok_actions

  tags = var.tags
}

# ALB Response Time Alarm
resource "aws_cloudwatch_metric_alarm" "alb_response_time" {
  count = var.create_alarms && var.alb_arn_suffix != null ? 1 : 0

  alarm_name          = "${var.dashboard_name}-alb-response-time"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Average"
  threshold           = var.alb_response_time_threshold
  alarm_description   = "ALB response time is high"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }

  alarm_actions = var.create_sns_topic ? [aws_sns_topic.alarms[0].arn] : var.alarm_actions
  ok_actions    = var.create_sns_topic ? [aws_sns_topic.alarms[0].arn] : var.ok_actions

  tags = var.tags
}

data "aws_region" "current" {}

