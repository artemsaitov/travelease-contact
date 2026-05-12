const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const crypto = require("crypto");

const region = process.env.REGION || "us-east-1";
const tableName = process.env.TABLE_NAME;
const senderEmail = process.env.SENDER_EMAIL;
const businessEmail = process.env.BUSINESS_EMAIL;

const dynamoClient = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({ region });

function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    },
    body: JSON.stringify(body)
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

exports.handler = async (event) => {
  console.log("Event received:", JSON.stringify(event, null, 2));

  try {
    let body;

    try {
      body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    } catch (error) {
      return createResponse(400, {
        message: "Invalid JSON body"
      });
    }

    const name = body?.name?.trim();
    const email = body?.email?.trim();
    const message = body?.message?.trim();
    const phone = body?.phone?.trim() || "Not provided";
    const destination = body?.destination?.trim() || "Not provided";

    if (!name || !email || !message) {
      return createResponse(400, {
        message: "Name, email, and message are required"
      });
    }

    if (!isValidEmail(email)) {
      return createResponse(400, {
        message: "Invalid email address"
      });
    }

    const referenceId = `TE-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const submittedAt = new Date().toISOString();

    const inquiryItem = {
      referenceId,
      name,
      email,
      phone,
      destination,
      message,
      submittedAt,
      status: "NEW"
    };

    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: inquiryItem
      })
    );

    console.log("Inquiry saved to DynamoDB:", inquiryItem);

    const customerEmailParams = {
      Source: senderEmail,
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Subject: {
          Data: `TravelEase Inquiry Received - ${referenceId}`
        },
        Body: {
          Text: {
            Data: `Hello ${name},

Thank you for contacting TravelEase.

We received your inquiry and our team will review it shortly.

Reference ID: ${referenceId}

Your message:
${message}

Best regards,
TravelEase Team`
          },
          Html: {
            Data: `
              <h2>Thank you for contacting TravelEase</h2>
              <p>Hello ${name},</p>
              <p>We received your inquiry and our team will review it shortly.</p>
              <p><strong>Reference ID:</strong> ${referenceId}</p>
              <p><strong>Your message:</strong></p>
              <p>${message}</p>
              <br>
              <p>Best regards,<br>TravelEase Team</p>
            `
          }
        }
      }
    };

    const businessEmailParams = {
      Source: senderEmail,
      Destination: {
        ToAddresses: [businessEmail]
      },
      Message: {
        Subject: {
          Data: `New TravelEase Contact Form Inquiry - ${referenceId}`
        },
        Body: {
          Text: {
            Data: `New inquiry received.

Reference ID: ${referenceId}
Submitted At: ${submittedAt}

Customer Name: ${name}
Customer Email: ${email}
Phone: ${phone}
Destination: ${destination}

Message:
${message}`
          },
          Html: {
            Data: `
              <h2>New TravelEase Inquiry</h2>
              <p><strong>Reference ID:</strong> ${referenceId}</p>
              <p><strong>Submitted At:</strong> ${submittedAt}</p>
              <hr>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Destination:</strong> ${destination}</p>
              <p><strong>Message:</strong></p>
              <p>${message}</p>
            `
          }
        }
      }
    };

    await sesClient.send(new SendEmailCommand(customerEmailParams));
    await sesClient.send(new SendEmailCommand(businessEmailParams));

    console.log("Emails sent successfully");

    return createResponse(200, {
      message: "Inquiry submitted successfully",
      referenceId
    });
  } catch (error) {
    console.error("Error processing inquiry:", error);

    return createResponse(500, {
      message: "Internal server error",
      error: error.message
    });
  }
};