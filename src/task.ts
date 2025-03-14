import { AutomationTask } from "./types";
import { logger } from "./logger";

// Flag to disable logging during validation
let isValidating = false;

export function setValidationMode(validating: boolean) {
  isValidating = validating;
}

/**
 * Creates a new AI agent workflow task with the given configuration
 */
export function task(config: AutomationTask): AutomationTask {
  if (!isValidating) {
    logger.info(`Creating new AI agent workflow task: ${config.name}`);
  }
  
  // Validate the task configuration
  if (!config.name) {
    throw new Error("Task must have a name");
  }
  
  if (!Array.isArray(config.triggers)) {
    throw new Error("Task must have triggers array");
  }
  
  if (!Array.isArray(config.steps)) {
    throw new Error("Task must have steps array");
  }

  if (config.steps.length === 0) {
    throw new Error("Task must have at least one step");
  }

  // Validate each step has required properties
  config.steps.forEach((step, index) => {
    if (!step.prompt) {
      throw new Error(`Step ${index} must have a prompt`);
    }
    if (typeof step.maxSteps !== 'number' || step.maxSteps <= 0) {
      throw new Error(`Step ${index} must have a positive maxSteps value`);
    }
  });

  // Return the validated task configuration
  return config;
} 