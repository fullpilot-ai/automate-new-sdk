# Automate New SDK

A TypeScript-based automation framework for building and deploying automations to automate.new, powered by Cloudflare Workers and Hono.js.

## Overview

This library allows you to create automations with a simple, declarative API. Each automation consists of:
- **Functions**: Reusable pieces of logic that can be triggered
- **Triggers**: Ways to invoke your functions (manual, webhook, or cron-based)

Your automations are deployed as Cloudflare Workers, making them globally distributed and highly available.

## Features

- Simple, declarative API for defining automations
- Built on Cloudflare Workers for global deployment
- Multiple trigger types:
  - Webhook triggers for HTTP-based automation
  - Cron triggers for scheduled tasks (UTC-based)
  - Manual triggers with parameter validation
- Type-safe function definitions and parameters
- JSON Schema validation for parameters
- Built-in logging and error handling
- Powered by Hono.js for fast HTTP handling

## Quick Start

1. Install the package:
```bash
npm install automate-new-cli
```

2. Create your automation:
```typescript
import { task, automate } from 'automate-new-cli';

const myAutomation = task({
  name: "my-automation",
  functions: [
    {
      name: "sayHello",
      parameters: {
        type: "object",
        required: ["name"],
        properties: {
          name: { 
            type: "string",
            description: "Name to greet",
            minLength: 1
          }
        }
      },
      execute: async (params) => {
        console.log(`Hello, ${params.name}!`);
      }
    }
  ],
  triggers: [
    {
      name: "manual-hello",
      type: "manual",
      parameters: {
        type: "object",
        required: ["name"],
        properties: {
          name: { 
            type: "string",
            description: "Name to greet",
            minLength: 1
          }
        }
      },
      execute: async ({ params, trigger }) => {
        await trigger("sayHello", { name: params.name });
      }
    }
  ]
});

export default {
  fetch: automate.serve(myAutomation).fetch
};
```

3. Deploy to Cloudflare Workers:
```bash
npm run deploy
```

## API Reference

### Task Definition

A task is the main building block of an automation. It consists of functions and triggers:

```typescript
interface AutomationTask {
  name: string;
  triggers: Trigger[];
  functions: AutomationFunction[];
}
```

### Parameter Validation

The SDK uses JSON Schema for parameter validation. This provides rich validation capabilities:

```typescript
{
  parameters: {
    type: "object",
    required: ["email", "subject"],
    properties: {
      email: {
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
        default: "Default message",
        examples: ["Example message 1", "Example message 2"]
      }
    }
  }
}
```

Supported validations include:
- Type checking (`type`)
- Required fields (`required`)
- String formats (`format`)
- Length constraints (`minLength`, `maxLength`)
- Numeric ranges (`minimum`, `maximum`)
- Pattern matching (`pattern`)
- Enums (`enum`)
- Default values (`default`)
- And more...

### Trigger Types

#### Manual Trigger
Allows manual invocation with parameter validation:
```typescript
{
  name: "my-trigger",
  type: "manual",
  parameters: {
    type: "object",
    properties: {
      // JSON Schema validation
    }
  },
  execute: async ({ params, trigger }) => {
    // Your trigger logic
  }
}
```

#### Webhook Trigger
Handles HTTP requests:
```typescript
{
  name: "webhook-trigger",
  type: "webhook",
  execute: async ({ req, res, trigger }) => {
    // Your webhook logic
  }
}
```

#### Cron Trigger
Runs on a schedule (UTC time):
```typescript
{
  name: "scheduled-trigger",
  type: "cron",
  cron: "0 19 * * *", // Runs at 19:00 UTC (2:00 PM EST)
  execute: async ({ trigger }) => {
    // Your scheduled logic
  }
}
```

## HTTP Endpoints

When deployed, your automation exposes these endpoints:

- `POST /{function-name}` - Direct function execution
- `POST /manual-trigger/{trigger-name}` - Manual trigger execution
- `POST /webhook/{trigger-name}` - Webhook trigger endpoint
- `POST /cronjob-trigger/{trigger-name}` - Cron trigger endpoint
- `GET /` - Health check endpoint

## Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/automate-new-cli.git
```

2. Install dependencies:
```bash
npm install
```

3. Run locally:
```bash
npm run dev
```

## License

Apache License 2.0. See [LICENSE](LICENSE) for more details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 