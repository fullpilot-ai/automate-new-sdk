import { task, automate } from 'automate-new-sdk';

const testAutomation = task({
  name: "test-automation",
  functions: [
    {
      name: "testFunction",
      parameters: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            description: "Test message"
          }
        }
      },
      execute: async ({ params }) => {
        console.log(`Test message: ${params.message}`);
      }
    }
  ],
  triggers: []
});

console.log("Automation created successfully!"); 