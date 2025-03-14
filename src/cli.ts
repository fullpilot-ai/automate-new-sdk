#!/usr/bin/env node

import { AutomationTask, Step, Trigger } from './types';
import { logger } from './logger';
import { setValidationMode } from './task';
import * as fs from 'fs';
import * as path from 'path';

function validateStep(step: Step, index: number): string[] {
  const errors: string[] = [];

  if (!step.prompt) {
    errors.push(`Step ${index}: Missing prompt`);
  }

  if (typeof step.maxSteps !== 'number' || step.maxSteps <= 0) {
    errors.push(`Step ${index}: maxSteps must be a positive number`);
  }

  return errors;
}

function validateTrigger(trigger: Trigger, index: number): string[] {
  const errors: string[] = [];

  if (!trigger.type) {
    errors.push(`Trigger ${index}: Missing type`);
  }

  if (trigger.type === 'scheduled' && !trigger.cron) {
    errors.push(`Trigger ${index}: Scheduled trigger missing cron expression`);
  }

  if (trigger.type === 'manual' && !trigger.schema) {
    errors.push(`Trigger ${index}: Manual trigger missing schema`);
  }

  return errors;
}

function validateTask(task: AutomationTask): string[] {
  const errors: string[] = [];

  // Validate basic task properties
  if (!task.name) {
    errors.push('Task missing name');
  }

  if (!task.version) {
    errors.push('Task missing version');
  }

  // Validate triggers
  if (!Array.isArray(task.triggers) || task.triggers.length === 0) {
    errors.push('Task must have at least one trigger');
  } else {
    task.triggers.forEach((trigger, index) => {
      errors.push(...validateTrigger(trigger, index));
    });
  }

  // Validate steps
  if (!Array.isArray(task.steps) || task.steps.length === 0) {
    errors.push('Task must have at least one step');
  } else {
    task.steps.forEach((step, index) => {
      errors.push(...validateStep(step, index));
    });
  }

  return errors;
}

async function findTaskFiles(dir: string = '.'): Promise<string[]> {
  const files = await fs.promises.readdir(dir);
  const taskFiles: string[] = [];

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.promises.stat(fullPath);

    // Skip dist and src directories
    if (fullPath.includes('/dist/') || fullPath.includes('/src/')) {
      continue;
    }

    if (stat.isDirectory()) {
      const subDirFiles = await findTaskFiles(fullPath);
      taskFiles.push(...subDirFiles);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      try {
        // Try to import the file to check if it exports a task
        const module = await import(path.resolve(fullPath));
        const hasTasks = Object.values(module).some(
          exp => typeof exp === 'object' && 
                 exp !== null && 
                 'name' in exp && 
                 'steps' in exp &&
                 'triggers' in exp
        );
        
        if (hasTasks) {
          taskFiles.push(fullPath);
        }
      } catch (error) {
        // Skip files that can't be imported
        continue;
      }
    }
  }

  return taskFiles;
}

export async function validateCommand() {
  try {
    // Enable validation mode to suppress task initialization logs
    setValidationMode(true);
    
    logger.info('🔍 Validating automation tasks...\n');
    
    const taskFiles = await findTaskFiles();
    
    if (taskFiles.length === 0) {
      logger.error('❌ No task files found');
      process.exit(1);
    }

    logger.info(`📁 Found ${taskFiles.length} task file(s)\n`);
    
    let hasErrors = false;
    let validTaskCount = 0;
    
    for (const file of taskFiles) {
      logger.info(`📄 Validating ${file}...`);
      
      try {
        // Dynamic import of the task file
        const taskModule = await import(path.resolve(file));
        const tasks = Object.values(taskModule).filter(
          (exp): exp is AutomationTask => 
            typeof exp === 'object' && 
            exp !== null && 
            'name' in exp && 
            'steps' in exp &&
            'triggers' in exp
        );

        if (tasks.length === 0) {
          logger.error(`  ❌ No tasks found in file`);
          hasErrors = true;
          continue;
        }

        for (const task of tasks) {
          const errors = validateTask(task);
          
          if (errors.length > 0) {
            logger.error(`\n❌ Validation errors in task "${task.name}":`);
            errors.forEach(error => logger.error(`   • ${error}`));
            hasErrors = true;
          } else {
            validTaskCount++;
            logger.info(`  ✅ Task "${task.name}" is valid`);
            logger.info(`     Description: ${task.description || 'No description'}`);
            logger.info(`     Version: ${task.version}`);
            logger.info(`     Triggers: ${task.triggers.length}`);
            logger.info(`     Steps: ${task.steps.length}\n`);
          }
        }
      } catch (error) {
        logger.error(`  ❌ Error processing file:`);
        logger.error(`     ${error instanceof Error ? error.message : String(error)}`);
        hasErrors = true;
      }
    }

    if (hasErrors) {
      logger.error('\n❌ Validation failed. Please fix the errors above.');
      process.exit(1);
    }
    
    logger.info(`\n✨ Success! ${validTaskCount} task(s) validated successfully.`);
  } catch (error) {
    logger.error('\n❌ Validation failed:');
    logger.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    // Reset validation mode
    setValidationMode(false);
  }
} 