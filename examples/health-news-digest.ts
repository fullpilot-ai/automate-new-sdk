import { task, automate } from '../src';
import { z } from 'zod';

const EmailRecipient = z.object({
  email: z.string().email().describe("Email address to receive the health digest")
});

const dailyHealthDigest = task({
  name: "daily-health-digest",
  description: "Creates a daily digest of the top 5 health stories, with summaries and analysis",
  version: "1.0.0",
  
  triggers: [
    // Manual trigger to generate digest on demand
    {
      type: "manual",
      schema: EmailRecipient
    },
    // Scheduled trigger to run daily at 7 AM UTC
    {
      type: "scheduled",
      cron: "0 7 * * *"
    }
  ],
  
  steps: [
    {
      prompt: "Search for today's most significant health news stories. Use multiple search queries to gather a diverse set of sources. Focus on major medical discoveries, public health updates, and breakthrough research. Collect at least 10 stories to ensure we have enough to choose from.",
      maxSteps: 5,
      tools: ["WEB_SEARCH"]
    },
    {
      prompt: "Analyze the collected stories and select the top 5 most important ones. Consider factors like: impact on public health, scientific significance, source credibility, and general public interest. Remove any duplicate stories or those covering the same topic from different sources. For each selected story, extract the key information including headline, source, and main points.",
      maxSteps: 3,
    },
    {
      prompt: "Create an engaging newsletter format for the digest. For each story: 1) Write a compelling headline, 2) Provide a 2-3 sentence summary that captures the key points, 3) Add a brief explanation of why this matters to the general public. Use clear, accessible language while maintaining accuracy. Add a brief introduction at the top that sets the context for today's health news.",
      maxSteps: 4,
    },
    {
      prompt: "Send the formatted digest via email. Use a professional newsletter template. Include a footer with subscription preferences and the date. Ensure proper formatting with clear section breaks between stories. Track email delivery and log any issues.",
      maxSteps: 2,
      tools: ["SENDGRID"]
    }
  ]
});

// Initialize the automation
automate.serve(dailyHealthDigest); 