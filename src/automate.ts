import { AutomationTask, Step, TriggerType } from "./types";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "./logger";

// Create a new Hono app instance
const app = new Hono();

// Enable CORS
app.use("/*", cors());

// Store the current task being served
let currentTask: AutomationTask | null = null;

// Flag to check if we're in validation mode
let isValidating = false;

export function setValidationMode(validating: boolean) {
  isValidating = validating;
}

/**
 * Executes a series of AI agent steps with the given input
 */
async function executeWorkflow(input: any = {}): Promise<void> {
  if (!currentTask) {
    throw new Error("No task is currently being served");
  }

  if (!isValidating) {
    logger.info(`Starting workflow: ${currentTask.name}`);
    logger.info(`Input data: ${JSON.stringify(input)}`);
  }

  // Execute each step in sequence
  for (const step of currentTask.steps) {
    await executeStep(step, input);
  }

  if (!isValidating) {
    logger.info('Workflow completed successfully');
  }
}

/**
 * Executes a single step in the workflow
 */
async function executeStep(step: Step, input: any): Promise<void> {
  if (!isValidating) {
    logger.info(`Executing step with prompt: ${step.prompt}`);
    logger.info(`Max steps allowed: ${step.maxSteps}`);
  }
  
  // TODO: Implement actual LLM interaction and tool usage here
  // This is where you would:
  // 1. Send the prompt to the LLM
  // 2. Process its responses
  // 3. Execute any tools it requests
  // 4. Track the number of steps taken
  // 5. Stop if maxSteps is reached
}

/**
 * Sets up the automation server with routes for the AI agent workflow
 */
export const automate = {
  serve: (task: AutomationTask): Hono => {
    if (!isValidating) {
      logger.info(`Serving AI agent workflow: ${task.name}`);
    }
    
    // Store the current task
    currentTask = task;

    // Add a health check endpoint
    app.get("/", (c) => c.json({ 
      status: "ok", 
      name: task.name,
      description: task.description,
      version: task.version 
    }));

    // Set up trigger endpoints
    task.triggers.forEach((trigger, index) => {
      const route = `/trigger/${index}`;
      
      if (trigger.type === "manual") {
        if (!isValidating) {
          logger.info(`Registering manual trigger endpoint: POST ${route}`);
        }
        
        app.post(route, async (c) => {
          try {
            const body = await c.req.json();
            // Validate input against schema
            trigger.schema.parse(body);
            
            await executeWorkflow(body);
            
            return c.json({ 
              success: true, 
              message: "Workflow executed successfully" 
            });
          } catch (error) {
            logger.error(`Error executing workflow: ${error}`);
            return c.json({ 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            }, 500);
          }
        });
      } else if (trigger.type === "scheduled") {
        if (!isValidating) {
          logger.info(`Registering scheduled trigger endpoint: POST ${route}`);
          logger.info(`Cron schedule: ${trigger.cron}`);
        }
        
        app.post(route, async (c) => {
          try {
            await executeWorkflow();
            
            return c.json({ 
              success: true, 
              message: "Scheduled workflow executed successfully" 
            });
          } catch (error) {
            logger.error(`Error executing scheduled workflow: ${error}`);
            return c.json({ 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            }, 500);
          }
        });
      }
    });

    return app;
  },
};