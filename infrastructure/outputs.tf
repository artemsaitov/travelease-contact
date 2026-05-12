output "website_bucket_name" {
  description = "S3 bucket name for the static website"
  value       = aws_s3_bucket.website.bucket
}

output "website_url" {
  description = "S3 static website URL"
  value       = aws_s3_bucket_website_configuration.website.website_endpoint
}

output "api_endpoint" {
  description = "API Gateway endpoint"
  value       = aws_apigatewayv2_api.contact_api.api_endpoint
}

output "submit_endpoint" {
  description = "Full contact form submit endpoint"
  value       = "${aws_apigatewayv2_api.contact_api.api_endpoint}/submit"
}

output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = aws_dynamodb_table.inquiries.name
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.submit_inquiry.function_name
}

output "sns_alert_topic_arn" {
  description = "SNS topic ARN for CloudWatch alarm alerts"
  value       = aws_sns_topic.alerts.arn
}

output "lambda_error_alarm_name" {
  description = "CloudWatch alarm name for Lambda errors"
  value       = aws_cloudwatch_metric_alarm.lambda_errors.alarm_name
}