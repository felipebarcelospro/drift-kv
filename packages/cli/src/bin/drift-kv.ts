#!/usr/bin/env node

import { Command } from 'commander';
import { createEntity } from '../commands/create-entity';
import { createQueue } from '../commands/create-queue';
import { init } from '../commands/init';

const program = new Command();

program
  .version('1.0.0')
  .description('Drift KV CLI');

program
  .command('init')
  .description('Initialize a new Drift KV project')
  .action(async () => {
    await init();
  });

program
  .command('create <type>')
  .description('Create a new entity or queue')
  .action(async (type) => {
    if (type === 'entity') {
      await createEntity();
    } else if (type === 'queue') {
      await createQueue(); 
    } else {
      console.error('Invalid type. Use "entity" or "queue".');
    }
  });

program.parse(process.argv);
