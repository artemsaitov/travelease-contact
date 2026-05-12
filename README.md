# TravelEase Contact Form Solution

TravelEase Contact Form Solution is a serverless AWS project designed to replace a basic `mailto` contact link with a professional customer inquiry system. The solution allows customers to submit travel inquiries through a responsive web form, stores each submission in DynamoDB, and sends automated email notifications using Amazon SES.

## Project Overview

TravelEase Inc. needed a more reliable way to manage customer inquiries for vacation packages, cruises, and travel planning services. A simple email link can create communication gaps because customers may not receive confirmation, messages may get lost, and the business has no structured way to track incoming requests.

This project solves that problem by creating a serverless contact form workflow using AWS managed services.

## Architecture

The application follows a simple serverless architecture:

```text
Customer Browser
      ↓
S3 Static Website
      ↓
API Gateway /submit
      ↓
AWS Lambda
      ↓
DynamoDB + Amazon SES
      ↓
Customer Confirmation Email + Business Notification Email
      ↓
CloudWatch Logs


AWS Services Used:

| Service            |    Purpose  --------------------------------------------------------- |
| Amazon S3          | Hosts the static frontend website                         |
| Amazon API Gateway | Provides the public HTTPS API endpoint                    |
| AWS Lambda         | Processes contact form submissions                        |
| Amazon DynamoDB    | Stores customer inquiry records                           |
| Amazon SES         | Sends confirmation and business notification emails       |
| Amazon CloudWatch  | Stores Lambda execution logs                              |
| AWS IAM            | Controls service permissions using least privilege access |
| Terraform          | Provisions and manages cloud infrastructure               |

Features:

Responsive static contact form
Client-side form validation
Server-side validation in Lambda
Unique reference ID generation for each inquiry
Secure inquiry storage in DynamoDB
Automated customer confirmation email
Automated business notification email
CloudWatch logging for troubleshooting and monitoring
Infrastructure as Code using Terraform

How It Works: 

1. A customer visits the TravelEase contact form hosted on Amazon S3.
2. The customer submits their name, email, phone number, destination, and travel details.
3. The frontend sends the form data as a JSON request to API Gateway.
4. API Gateway invokes the Lambda function.
5. Lambda validates the request and generates a unique reference ID.
6. Lambda stores the inquiry in DynamoDB.
7. Lambda sends a confirmation email to the customer using Amazon SES.
8. Lambda sends a notification email to the TravelEase business inbox.
9. CloudWatch records execution logs for monitoring and troubleshooting.

Example API Request:

curl -X POST "https://your-api-id.execute-api.us-east-1.amazonaws.com/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Johnson",
    "email": "customer@example.com",
    "phone": "555-123-4567",
    "destination": "Bahamas Family Vacation",
    "message": "Hello TravelEase team, I am interested in planning a 7-day family vacation to the Bahamas this summer. We are a family of four and would like help finding an all-inclusive resort with flights, airport transportation, and family-friendly activities."
  }'

  Example Successful Response:

  {
  "message": "Inquiry submitted successfully",
  "referenceId": "TE-A1B2C3D4"
}

DynamoDB Item Example: 

{
  "referenceId": "TE-A1B2C3D4",
  "name": "Maria Johnson",
  "email": "customer@example.com",
  "phone": "555-123-4567",
  "destination": "Bahamas Family Vacation",
  "message": "Hello TravelEase team, I am interested in planning a 7-day family vacation...",
  "submittedAt": "2026-05-11T20:45:00.000Z",
  "status": "NEW"
}

Deployment Steps

1. Clone the Repository:
git clone https://github.com/YOUR-USERNAME/travelease-contact.git
cd travelease-contact

2. Install Lambda Dependencies

cd lambda
npm install

3. Configure Terraform Variables

Update infrastructure/terraform.tfvars:

aws_region     = "us-east-1"
project_name   = "travelease-contact"
environment    = "dev"

sender_email   = "your-verified-sender@example.com"
business_email = "your-verified-business-email@example.com"

4. Verify SES Email Identities

In Amazon SES, verify the sender and recipient email addresses.

For SES sandbox mode, both the sender and recipient email addresses must be verified before testing.

5. Deploy Infrastructure

cd ../infrastructure
terraform init
terraform validate
terraform plan
terraform apply

6. Update Frontend API Endpoint

Copy the submit_endpoint output from Terraform and add it to frontend/script.js:

const API_ENDPOINT = "https://your-api-id.execute-api.us-east-1.amazonaws.com/submit";

7. Upload Frontend to S3

aws s3 sync ../frontend/ s3://your-s3-bucket-name --region us-east-1

8. Open the Website

Use the Terraform output:

terraform output website_url

Open the S3 website URL in a browser and submit a test inquiry.

Testing Checklist

The project was tested successfully by confirming:

The frontend form submits successfully from the browser
API Gateway receives the request
Lambda processes the request successfully
DynamoDB stores a new inquiry item
Customer confirmation email is received
Business notification email is received
CloudWatch Logs show successful Lambda execution
Command Line Verification
Check Latest DynamoDB Item

aws dynamodb scan \
  --table-name travelease-contact-dev-inquiries \
  --region us-east-1 \
  --query "Items | sort_by(@, &submittedAt.S)[-1].{ReferenceID: referenceId.S, Name: name.S, Email: email.S, Destination: destination.S, Status: status.S, SubmittedAt: submittedAt.S, Message: message.S}" \
  --output table

  Check Latest CloudWatch Logs:

  LOG_STREAM=$(aws logs describe-log-streams \
  --log-group-name "/aws/lambda/travelease-contact-dev-submit-inquiry" \
  --order-by LastEventTime \
  --descending \
  --max-items 1 \
  --region us-east-1 \
  --query "logStreams[0].logStreamName" \
  --output text)

aws logs get-log-events \
  --log-group-name "/aws/lambda/travelease-contact-dev-submit-inquiry" \
  --log-stream-name "$LOG_STREAM" \
  --region us-east-1

Security Considerations
Lambda uses an IAM role with limited permissions.
DynamoDB access is restricted to required write operations.
SES permissions are used only for email sending.
API Gateway handles public API access.
Form data is validated on both the frontend and backend.
Sensitive values should not be hardcoded in frontend files.
In a production environment, additional spam protection such as reCAPTCHA should be added.
Current Limitations
The project currently uses an S3 static website endpoint, which serves content over HTTP.
SES is currently in sandbox mode, so only verified email addresses can receive messages.
No custom domain has been configured yet.
No reCAPTCHA or advanced spam protection has been added yet.
No admin dashboard exists for viewing inquiries.
Future Improvements
Add CloudFront for HTTPS and better performance.
Add a custom domain name.
Request SES production access.
Add reCAPTCHA to reduce spam submissions.
Add CloudWatch Alarms and SNS alerts for Lambda errors.
Add DynamoDB point-in-time recovery.
Build an admin dashboard for viewing and managing inquiries.
Add API throttling and stricter CORS configuration.
Improve email templates with branded TravelEase styling.
Skills Demonstrated

This project demonstrates hands-on experience with:

AWS serverless architecture
Terraform Infrastructure as Code
API Gateway and Lambda integration
DynamoDB data storage
SES email automation
CloudWatch logging and troubleshooting
IAM permissions and least privilege access
Static website hosting with S3
Frontend and backend integration
End-to-end cloud application deployment
Conclusion

The TravelEase Contact Form Solution successfully transforms a basic customer inquiry process into a reliable, automated, and scalable serverless workflow. It improves the customer experience by providing immediate confirmation emails and gives the business a structured way to store, track, and respond to travel inquiries.


