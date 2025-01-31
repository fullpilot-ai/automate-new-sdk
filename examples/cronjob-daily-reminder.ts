import { task, automate, trigger } from '../src';
import { z } from 'zod';

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
  name: "daily-reminder",
  description: "Sends daily reminder emails at 2 PM EST",
  version: "1.0.0",
  
  triggers: [
    {
      name: "daily-2pm-trigger",
      type: "cron",
      cron: "0 19 * * *", // 2:00 PM EST (19:00 UTC)
      execute: async () => {
        await trigger("sendReminderEmail", {
          to: "recipient@example.com",
          subject: "Daily Reminder",
          body: "This is your daily reminder message!"
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

// Start the automation
automate.serve(dailyReminder);

// Export the task for potential reuse
export default dailyReminder; 