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
  /** 
   * Cron expression (e.g. "0 13 * * *") in UTC time
   * Note: Cloudflare Workers evaluate cron expressions in UTC.
   * For example, "0 19 * * *" will run at 2:00 PM EST (19:00 UTC)
   */
  cron: string;
  execute: (context: {
    trigger: TriggerFunction;
  }) => Promise<void> | void;
}

// Manual triggers create a form that can be used to trigger the automation
export interface ManualTrigger {
  name: string;
  type: "manual";
  parameters: JSONSchema;
  execute: (context: { 
    params: Record<string, any>;
    trigger: TriggerFunction;
  }) => Promise<void> | void;
}

export type Trigger = WebhookTrigger | CronTrigger | ManualTrigger;

// For function definitions
export interface AutomationFunction {
  name: string;
  parameters: JSONSchema;
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

/**
 * JSON Schema type definition based on JSON Schema Draft-07
 */
export interface JSONSchema {
  type?: string | string[];
  properties?: Record<string, JSONSchema>;
  required?: string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  enum?: any[];
  default?: any;
  description?: string;
  title?: string;
  examples?: any[];
  items?: JSONSchema | JSONSchema[];
  additionalProperties?: boolean | JSONSchema;
  allOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  not?: JSONSchema;
} 