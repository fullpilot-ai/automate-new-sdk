import { AutomationTask, TriggerParams, TriggerOptions, ManualTrigger, WebhookTrigger, CronTrigger } from "./types";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from 'hono/cloudflare-workers';
import { logger } from "./logger";

// Create a new Hono app instance
const app = new Hono();

// Enable CORS
app.use("/*", cors());

// Store the current task being served
let currentTask: AutomationTask | null = null;

/**
 * A helper function to trigger one of the defined functions by name.
 * Supports sleeping before execution via options.sleep (in milliseconds)
 */
export async function trigger(
  functionName: string, 
  params: TriggerParams, 
  options?: TriggerOptions
): Promise<void> {
  logger.info(`Triggering function: ${functionName} with params: ${JSON.stringify(params)}, options: ${JSON.stringify(options)}`);
  
  if (!currentTask) {
    throw new Error("No task is currently being served");
  }

  const fn = currentTask.functions.find(f => f.name === functionName);
  if (!fn) {
    throw new Error(`Function ${functionName} not found`);
  }

  // If sleep duration is specified, wait before proceeding
  if (options?.delay) {
    logger.debug(`Sleeping for ${options.delay}ms before executing ${functionName}`);
    await new Promise(resolve => setTimeout(resolve, Number(options.delay)));
  }

  // Execute the function
  await fn.execute(params);
}

/**
 * A function that "serves" or starts the automation.
 * Sets up Hono routes for functions and triggers in the task.
 */
export const automate = {
  serve: (task: AutomationTask): Hono => {
    logger.info(`Serving automation: ${task.name}`);
    
    // Store the current task
    currentTask = task;

    // Add a health check endpoint
    app.get("/", (c) => c.json({ status: "ok", name: task.name }));

    // Register each function as a POST endpoint
    task.functions.forEach((fn) => {
      const route = `/${fn.name}`;
      logger.info(`Registering function endpoint: POST ${route}`);
      
      app.post(route, async (c) => {
        try {
          const body = await c.req.json();
          const params = body.parameters || {};
          
          await fn.execute(params);
          
          return c.json({ 
            success: true, 
            message: `Function ${fn.name} executed successfully`
          });
        } catch (error) {
          logger.error(`Error executing function ${fn.name}: ${error}`);
          return c.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }, 500);
        }
      });
    });

    // Register trigger endpoints based on their type
    task.triggers.forEach((triggerConfig) => {
      let route: string;
      
      switch (triggerConfig.type) {
        case "manual": {
          const trigger = triggerConfig as ManualTrigger;
          route = `/manual-trigger/${trigger.name}`;
          logger.info(`Registering manual trigger endpoint: POST ${route}`);
          
          app.post(route, async (c) => {
            try {
              const body = await c.req.json();
              const params = body.parameters || {};
              
              await trigger.execute(params);
              
              return c.json({
                success: true,
                message: `Manual trigger ${trigger.name} executed successfully`
              });
            } catch (error) {
              logger.error(`Error executing manual trigger ${trigger.name}: ${error}`);
              return c.json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              }, 500);
            }
          });
          break;
        }

        case "cron": {
          const trigger = triggerConfig as CronTrigger;
          route = `/cronjob-trigger/${trigger.name}`;
          logger.info(`Registering cron trigger endpoint: POST ${route}`);
          
          app.post(route, async (c) => {
            try {
              await trigger.execute();
              
              return c.json({
                success: true,
                message: `Cron trigger ${trigger.name} executed successfully`
              });
            } catch (error) {
              logger.error(`Error executing cron trigger ${trigger.name}: ${error}`);
              return c.json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              }, 500);
            }
          });
          break;
        }

        case "webhook": {
          const trigger = triggerConfig as WebhookTrigger;
          route = `/webhook/${trigger.name}`;
          logger.info(`Registering webhook trigger endpoint: POST ${route}`);
          
          app.post(route, async (c) => {
            try {
              await trigger.execute(c);
              
              // If no response has been sent by the webhook handler, send a default success
              if (!c.res.headers.get('content-type')) {
                return c.json({
                  success: true,
                  message: `Webhook trigger ${trigger.name} executed successfully`
                });
              }
              
              // If the handler set a response, it will be used automatically
              return c.res;
            } catch (error) {
              logger.error(`Error executing webhook trigger ${trigger.name}: ${error}`);
              return c.json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              }, 500);
            }
          });
          break;
        }
      }
    });

    // Return the Hono app
    return app;
  },
};