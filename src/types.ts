/** 
 * This file defines a TypeScript interface to mirror the structure 
 * used by the "task" object from automate.new.
 */
import { z } from 'zod';
import type { Context } from 'hono';

export type TriggerType = "scheduled" | "manual";

// Available tools that can be used in the workflow
export type Tool = "SENDGRID" | "OPENAI" | "GRAMMARLY";

export interface ScheduledTrigger {
  type: "scheduled";
  cron: string; // Cron expression in UTC time
}

export interface ManualTrigger {
  type: "manual";
  schema: z.ZodType; // Schema for input validation
}

export type Trigger = ScheduledTrigger | ManualTrigger;

export interface Step {
  prompt: string; // The prompt/instruction for the AI agent
  maxSteps: number; // Maximum number of steps the agent can take for this prompt
  tools?: string[]; // Tools that this step can use
}

// The overall Task structure for AI agent workflow
export interface AutomationTask {
  name: string;
  description?: string;
  version?: string;
  triggers: Trigger[];
  steps: Step[];
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
 * The trigger function signature with response type
 */
export type TriggerFunction = (
  functionName: string,
  params: TriggerParams,
  options?: TriggerOptions
) => Promise<void>; 

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