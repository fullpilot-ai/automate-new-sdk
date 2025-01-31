import { task, automate, trigger } from '../src';
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
  
  // Define the triggers
  triggers: [
    {
      name: "daily-1pm-trigger",
      type: "cron",
      // "0 13 * * *" represents 1:00 PM in IST
      // Note: Make sure your server is configured to IST timezone
      cron: "0 13 * * *",
      execute: async () => {
        await trigger("sendReminderEmail", {
          to: "recipient@example.com",
          subject: "Daily Reminder",
          body: "This is your daily reminder message!"
        });
      }
    }
  ],
  
  // Define the functions
  functions: [
    {
      name: "sendReminderEmail",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string" },
          subject: { type: "string" },
          body: { type: "string" }
        }
      },
      execute: async ({ params }) => {
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