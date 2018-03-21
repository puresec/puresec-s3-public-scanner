# puresec-s3-public-scanner
An AWS Lambda function that scans your account for S3 buckets with any kind of public permissions.
After installation, make sure you modify the 'DESTINATION_EMAIL' environment variable with the email address to which you want the daily report to be sent to. 

Important: you should make sure that the email address is verified in your account's SES configuration. Follow these steps to verify an email address: https://docs.aws.amazon.com/ses/latest/DeveloperGuide/verify-email-addresses-procedure.html
