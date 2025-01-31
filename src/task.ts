import { AutomationTask } from "./types";
import { logger } from "./logger";

/**
 * Creates a new automation task with the given configuration
 */
export function task(config: AutomationTask): AutomationTask {
  logger.info(`Creating new task: ${config.name}`);
  
  // Validate the task configuration
  if (!config.name) {
    throw new Error("Task must have a name");
  }
  
  if (!Array.isArray(config.triggers)) {
    throw new Error("Task must have triggers array");
  }
  
  if (!Array.isArray(config.functions)) {
    throw new Error("Task must have functions array");
  }

  // Return the validated task configuration
  return config;
} 