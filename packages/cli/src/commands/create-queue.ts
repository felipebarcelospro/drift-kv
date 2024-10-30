import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';

export async function createQueue() {
  // Load the config
  const config = require(path.resolve('drift.config.js'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'queueName',
      message: 'Queue name:',
    },
  ]);

  // Define the schema fields
  const fields = [];
  let addMore = true;

  while (addMore) {
    const fieldAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'fieldName',
        message: 'Field name:',
      },
      {
        type: 'list',
        name: 'fieldType',
        message: 'Field type:',
        choices: ['string', 'number', 'boolean', 'date', 'uuid'],
      },
      {
        type: 'confirm',
        name: 'isOptional',
        message: 'Is this field optional?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'addAnother',
        message: 'Add another field?',
        default: true,
      },
    ]);

    fields.push(fieldAnswers);
    addMore = fieldAnswers.addAnother;
  }

  // Generate the queue file content
  const zodFields = fields
    .map(
      (field) =>
        `${field.fieldName}: z.${field.fieldType}()${
          field.isOptional ? '.optional()' : ''
        },`
    )
    .join('\n    ');

  const queueContent = `
import { DriftQueue } from "@drift-kv/core";
import { z } from "zod";

export const ${answers.queueName}Queue = new DriftQueue({
  name: "${answers.queueName}",
  schema: (z) => ({
    ${zodFields}
  }),
  handler: async (job) => {
    // Implement your job processing logic here
  },
});
`;

  // Write the queue file
  const queueFilePath = path.join(
    config.queuesPath,
    `${answers.queueName}.queue.ts`
  );
  fs.writeFileSync(queueFilePath, queueContent.trim());
  console.log(`Created queue: ${queueFilePath}`);

  // Update queues index
  const indexPath = path.join(config.queuesPath, 'index.ts');
  let indexContent = fs.readFileSync(indexPath, 'utf-8');

  // Check if the queue is already imported
  if (!indexContent.includes(`${answers.queueName}Queue`)) {
    indexContent = `
import { ${answers.queueName}Queue } from "./${answers.queueName}.queue";
${indexContent}

export const queues = {
  ...queues,
  ${answers.queueName}: ${answers.queueName}Queue,
};
`;
    fs.writeFileSync(indexPath, indexContent.trim());
    console.log('Updated queues index.');
  }
};
