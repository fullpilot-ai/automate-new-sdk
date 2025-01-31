/** 
 * This file defines a TypeScript interface to mirror the structure 
 * used by the "task" object from automate.new.
 */
export type TriggerType = "webhook" | "cron" | "manual";

export interface WebhookTrigger {
  name: string;
  type: "webhook";
  execute: (context: { 
    req: any;  // Using any for now since we're using Hono's request type
    res: any;  // Using any for now since we're using Hono's response type
    trigger: TriggerFunction;
  }) => Promise<void> | void;
}

export interface CronTrigger {
  name: string;
  type: "cron";
  cron: string; // cron expression like "0 13 * * *"
  execute: (context: {
    trigger: TriggerFunction;
  }) => Promise<void> | void;
}

// Manual triggers create a form that can be used to trigger the automation
export interface ManualTrigger {
  name: string;
  type: "manual";
  parameters: {
    type: string;
    properties: Record<string, { type: string }>;
  };
  execute: (context: { 
    params: Record<string, any>;
    trigger: TriggerFunction;
  }) => Promise<void> | void;
}

export type Trigger = WebhookTrigger | CronTrigger | ManualTrigger;

// For function definitions
export interface AutomationFunction {
  name: string;
  parameters: {
    type: string;
    properties: Record<string, { type: string }>;
  };
  execute: (params: Record<string, any>) => Promise<void> | void;
}

// Finally, the overall Task structure
export interface AutomationTask {
  name: string;
  triggers: Trigger[];
  functions: AutomationFunction[];
}

/**
 * Options for trigger execution, including an optional sleep duration
 * The sleep value should be in milliseconds
 */
export interface TriggerOptions {
  delay?: number | string; // Sleep duration in milliseconds or a string like "1s", "2m", etc.
}

/**
 * Type for parameters that can be passed to triggers and functions
 */
export type TriggerParams = Record<string, any>;

/**
 * The trigger function signature
 */
export type TriggerFunction = (
  functionName: string,
  params: TriggerParams,
  options?: TriggerOptions
) => Promise<void> | void; 