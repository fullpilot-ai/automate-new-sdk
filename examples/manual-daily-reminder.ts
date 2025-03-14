import { task, automate } from '../src';
import { z } from 'zod';

// Create the automation task
const dailyReminder = task({
  name: "manual-daily-reminder",
  description: "An AI agent that sends personalized reminder emails",
  version: "1.0.0",  
  triggers: [
    {
      type: "manual",
      schema: z.object({
        to: z.string().email().describe("Recipient email address"),
        subject: z.string().min(1).max(100).describe("Email subject line"),
        body: z.string().default("This is your daily reminder!").describe("Email body content")
      })
    },
    {
      type: "scheduled",
      cron: "0 9 * * *" // Run at 9 AM UTC daily
    }
  ],
  
  steps: [
    {
      prompt: "Send the email using the available email service. Verify the recipient's email format is valid and handle any potential sending errors gracefully. Log the email details for tracking purposes.",
      maxSteps: 3,
      tools: ["SENDGRID"]
    }
  ]
});

automate.serve(dailyReminder);