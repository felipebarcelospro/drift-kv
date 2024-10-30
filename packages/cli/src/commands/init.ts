import { execSync } from 'child_process';
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';

async function checkPrerequisites() {
  console.log('Checking prerequisites...');

  // Check for either Node.js 18+, Deno, or Bun
  let runtimeFound = false;

  // Check Node.js version
  try {
    const nodeVersion = process.version;
    const minNodeVersion = 'v18.0.0';
    if (nodeVersion.localeCompare(minNodeVersion, undefined, { numeric: true, sensitivity: 'base' }) >= 0) {
      console.log(`✓ Node.js ${nodeVersion} detected`);
      runtimeFound = true;
    }
  } catch (error) {
    // Node.js not found
  }

  // Check if Deno is installed
  try {
    execSync('deno --version', { stdio: 'ignore' });
    console.log('✓ Deno detected');
    runtimeFound = true;
  } catch (error) {
    // Deno not found
  }

  // Check if Bun is installed
  try {
    execSync('bun --version', { stdio: 'ignore' });
    console.log('✓ Bun detected');
    runtimeFound = true;
  } catch (error) {
    // Bun not found
  }

  if (!runtimeFound) {
    console.error('Error: You must have either Node.js v18+, Deno, or Bun installed.');
    console.error('Please install one of:');
    console.error('- Node.js: https://nodejs.org/');
    console.error('- Deno: https://deno.land/');
    console.error('- Bun: https://bun.sh/');
    process.exit(1);
  }

  // Check if TypeScript is installed
  try {
    execSync('tsc --version', { stdio: 'ignore' });
    console.log('✓ TypeScript detected');
  } catch (error) {
    console.error('TypeScript is not installed. Please install it globally with: npm install -g typescript');
    process.exit(1);
  }

  // Check if Git is installed
  try {
    execSync('git --version', { stdio: 'ignore' });
    console.log('✓ Git detected');
  } catch (error) {
    console.warn('Warning: Git is not installed. While not required, it is recommended for version control.');
  }

  console.log('✓ All required prerequisites are met!');
}

async function detectPackageManager() {
  // Check for lock files to detect package manager
  if (fs.existsSync('bun.lockb')) return 'bun';
  if (fs.existsSync('yarn.lock')) return 'yarn';
  if (fs.existsSync('package-lock.json')) return 'npm';
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (fs.existsSync('deno.lock')) return 'deno';
  
  // Default to npm if no lock file found
  return 'npm';
}

async function installDriftKV(packageManager: string) {
  console.log('Installing @drift-kv/core...');
  
  try {
    switch (packageManager) {
      case 'bun':
        execSync('bun add @drift-kv/core @deno/kv');
        break;
      case 'yarn':
        execSync('yarn add @drift-kv/core @deno/kv');
        break;
      case 'pnpm':
        execSync('pnpm add @drift-kv/core @deno/kv');
        break;
      case 'deno':
        execSync('deno add jsr:@drift-kv/core');
        break;
      default:
        execSync('npm install @drift-kv/core @deno/kv');
    }
    console.log('Successfully installed @drift-kv/core');
  } catch (error) {
    console.error('Failed to install @drift-kv/core:', error);
    process.exit(1);
  }
}

export async function init() {
  await checkPrerequisites();
  
  const packageManager = await detectPackageManager();
  console.log(`Detected package manager: ${packageManager}`);
  
  await installDriftKV(packageManager);

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
