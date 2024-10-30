import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';

export async function createEntity() {
  // Load the config
  const config = require(path.resolve('drift.config.js'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'entityName',
      message: 'Entity name:',
    },
    {
      type: 'confirm',
      name: 'useTimestamps',
      message: 'Include timestamps?',
      default: true,
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

  // Generate the entity file content
  const zodFields = fields
    .map(
      (field) =>
        `${field.fieldName}: z.${field.fieldType}()${
          field.isOptional ? '.optional()' : ''
        },`
    )
    .join('\n    ');

  const entityContent = `
import { DriftEntity } from "@drift-kv/core";

export const ${answers.entityName}Entity = new DriftEntity({
  name: "${answers.entityName}",
  options: {
    timestamps: ${answers.useTimestamps},
  },
  schema: (z) => ({
    ${zodFields}
  }),
});
`;

  // Write the entity file
  const entityFilePath = path.join(
    config.entitiesPath,
    `${answers.entityName}.entity.ts`
  );
  fs.writeFileSync(entityFilePath, entityContent.trim());
  console.log(`Created entity: ${entityFilePath}`);

  // Update entities index
  const indexPath = path.join(config.entitiesPath, 'index.ts');
  let indexContent = '';

  // Read existing content if file exists
  if (fs.existsSync(indexPath)) {
    indexContent = fs.readFileSync(indexPath, 'utf-8');
  }

  // Check if the entity is already imported
  if (!indexContent.includes(`${answers.entityName}Entity`)) {
    // Add new import if not empty file
    if (indexContent) {
      // Add import at the top
      const imports = indexContent.split('\n').filter(line => line.startsWith('import'));
      const rest = indexContent.split('\n').filter(line => !line.startsWith('import')).join('\n');
      
      imports.push(`import { ${answers.entityName}Entity } from "./${answers.entityName}.entity";`);
      
      indexContent = `${imports.join('\n')}\n\n${rest}`;
    } else {
      // First entity, create new file
      indexContent = `import { ${answers.entityName}Entity } from "./${answers.entityName}.entity";\n\nexport const entities = {};`;
    }

    // Add entity to exports
    indexContent = indexContent.replace(
      'export const entities = {',
      `export const entities = {\n  ...entities,\n  ${answers.entityName}: ${answers.entityName}Entity,`
    );

    fs.writeFileSync(indexPath, indexContent);
    console.log('Updated entities index.');
  }
};
