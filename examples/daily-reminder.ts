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
      name: "daily-2pm-trigger",
      type: "cron",
      // "0 19 * * *" represents 2:00 PM EST (19:00 UTC)
      cron: "0 19 * * *",
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
        required: ["to", "subject"],
        properties: {
          to: { 
            type: "string",
            format: "email",
            description: "Recipient email address"
          },
          subject: { 
            type: "string",
            minLength: 1,
            maxLength: 100,
            description: "Email subject line"
          },
          body: { 
            type: "string",
            default: "This is your daily reminder!",
            description: "Email body content",
            examples: [
              "Don't forget to check your tasks for today!",
              "Time for your daily review."
            ]
          }
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