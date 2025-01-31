import { task, automate, trigger } from '../src';
import { z } from 'zod';
import type { Context } from 'hono';

// Define schema for email parameters
const EmailParams = z.object({
  to: z.string().email().describe("Recipient email address"),
  subject: z.string().min(1).max(100).describe("Email subject line"),
  body: z.string().default("This is your daily reminder!").describe("Email body content")
});

type EmailParams = z.infer<typeof EmailParams>;

// Helper function to send email (implementation would depend on your email service)
async function sendEmail(to: string, subject: string, body: string) {
  // This is a mock implementation
  console.log(`Sending email to ${to}:`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  // In real implementation, you would use a service like nodemailer, SendGrid, etc.
}

// Create the automation task
const dailyReminder = task({
  name: "manual-daily-reminder",
  description: "Sends reminder emails via manual trigger or webhook",
  version: "1.0.0",
  
  triggers: [
    // Manual trigger with a form for sending emails
    {
      name: "send-email",
      type: "manual",
      parameters: EmailParams,
      execute: async (params) => {
        await trigger("sendReminderEmail", params);
      }
    },
    // Webhook trigger that accepts POST requests with email data
    {
      name: "webhook-email",
      type: "webhook",
      parameters: EmailParams,
      execute: async (c: Context) => {
        const body = await c.req.json();
        const params = EmailParams.parse(body);
        await trigger("sendReminderEmail", params);
        
        c.status(200);
        await c.json({
          success: true,
          message: "Email triggered successfully",
          recipient: params.to
        });
      }
    }
  ],
  
  functions: [
    {
      name: "sendReminderEmail",
      parameters: EmailParams,
      execute: async (params: EmailParams) => {
        await sendEmail(
          params.to,
          params.subject,
          params.body
        );
      }
    }
  ]
});

// Initialize the automation and get the Hono app
const app = automate.serve(dailyReminder);

// Export the fetch handler for Cloudflare Workers
// This pattern allows the worker to handle incoming HTTP requests
export default {
  fetch: app.fetch.bind(app)
}; 