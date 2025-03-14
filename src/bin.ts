#!/usr/bin/env node

import { validateCommand } from './cli';

const command = process.argv[2];

async function main() {
  switch (command) {
    case 'validate':
      await validateCommand();
      break;
    
    default:
      console.error('Unknown command. Available commands: validate');
      process.exit(1);
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 