import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';

export async function init() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'entitiesPath',
      message: 'Where do you want to store your entities?',
      default: './drift/entities',
    },
    {
      type: 'input',
      name: 'queuesPath',
      message: 'Where do you want to store your queues?',
      default: './drift/queues',
    },
    {
      type: 'input',
      name: 'driftServicePath',
      message: 'Path for the drift service file:',
      default: './drift/drift-service.ts',
    },
  ]);

  // Create directories if they don't exist
  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }
  };

  createDir(path.dirname(answers.driftServicePath));
  createDir(answers.entitiesPath);
  createDir(answers.queuesPath);

  // Create drift.config.js
  const configContent = `
module.exports = {
  entitiesPath: '${answers.entitiesPath}',
  queuesPath: '${answers.queuesPath}',
  driftServicePath: '${answers.driftServicePath}',
};
`;
  fs.writeFileSync('drift.config.js', configContent.trim());
  console.log('Created drift.config.js');

  // Create a sample drift-service.ts file
  const serviceContent = `
// Drift Service Initialization
import { Drift } from "@drift-kv/core";
import { entities } from "./entities";
import { queues } from "./queues";

// Open the database
const kv = await Deno.openKv("./db.sqlite3")

// Initialize the drift service
export const drift = new Drift({
  client: kv,
  schemas: {
    entities,
    queues,
  },
});
`;

  fs.writeFileSync(answers.driftServicePath, serviceContent.trim());
  console.log(`Created ${answers.driftServicePath}`);

  // Create index files for entities and queues
  fs.writeFileSync(
    path.join(answers.entitiesPath, 'index.ts'),
    'export const entities = {};'
  );
  fs.writeFileSync(
    path.join(answers.queuesPath, 'index.ts'),
    'export const queues = {};'
  );

  console.log('Initialization complete!');
};
