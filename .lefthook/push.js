const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const util = require('util');
const execAsync = util.promisify(require('child_process').exec);

const { execSync } = require('child_process');
const { generateObject } = require('ai');
const { createOpenAI } = require('@ai-sdk/openai');
const { z } = require('zod');

/**
 * Dynamically imports the 'ora' module for creating elegant terminal spinners.
 * If the import fails, a simple fallback is provided to ensure the script continues to function.
 * 
 * @type {Function|Object}
 * @example
 * // Successful import usage:
 * const spinner = ora('Loading...').start();
 * // ... some async operation
 * spinner.succeed('Operation completed');
 * 
 * // Fallback usage (if import fails):
 * const spinner = ora('Loading...').start();
 * // ... some async operation
 * spinner.succeed('Operation completed');
 * // Both cases will work, but the fallback won't display an actual spinner
 */
let ora;
import('ora').then(module => {
  ora = module.default;
}).catch(error => {
  console.error('Failed to import ora:', error);
  // Simple fallback in case ora fails to load
  ora = () => ({
    start: () => ({ succeed: () => {}, fail: () => {} }),
    succeed: () => {},
    fail: () => {}
  });
});

let inquirer;
import('inquirer').then(module => {
  inquirer = module.default;
}).catch(error => {
  console.error('Failed to import inquirer:', error);
});

/**
 * Creates and returns a CustomPushProcess instance.
 * This factory function initializes the process that automates Git operations
 * with AI-assisted branch and commit suggestions.
 * 
 * @returns {CustomPushProcess} An instance of the CustomPushProcess class.
 * @example
 * const customPushProcess = createCustomPushProcess();
 * await customPushProcess.main();
 */
function createCustomPushProcess() {
  class CustomPushProcess {
    /**
     * Initializes a new instance of the CustomPushProcess class.
     * Sets up the OpenAI API key.
     */
    constructor(options = {}) {
      this.openAiApiKey = null;
      this.recentCommitsLimit = options.recentCommitsLimit || 3;
    }

    /**
     * Converts a Git status character to a human-readable file status.
     * 
     * @param {string} statusChar - The Git status character.
     * @returns {string} The human-readable file status.
     */
    getFileStatus(statusChar) {
      const statusMap = {
        'A': 'new',
        'M': 'modified',
        'D': 'deleted',
        'R': 'renamed',
        'C': 'copied',
        'U': 'updated but unmerged',
        '??': 'untracked',
        '!!': 'ignored'
      };
      return statusMap[statusChar] || 'unknown';
    }

    /**
     * Retrieves metadata for a given file based on its status and diff stats.
     * 
     * @param {string} filePath - The path of the file.
     * @param {string} fileStatus - The status of the file.
     * @returns {Object} An object containing metadata about the file.
     */
    getFileMetadata(filePath, fileStatus) {
      const [linesAdded, linesRemoved] = this.getDiffStats(filePath);
      return {
        linesAdded: fileStatus === 'new' ? 'All' : parseInt(linesAdded) || 0,
        linesRemoved: fileStatus === 'deleted' ? 'All' : parseInt(linesRemoved) || 0,
        fileType: path.extname(filePath) || 'unknown'
      };
    }

    /**
     * Retrieves comprehensive information about all changed files in the Git repository.
     * 
     * @returns {Array<Object>} An array of objects containing detailed information about changed files.
     */
    getChangedFiles() {
      try {
        const statusOutput = execSync('git status --porcelain -z --untracked-files=all').toString().trim().split('\0');
        return statusOutput.reduce((acc, line) => {
          if (!line) return acc;
          const [status, filePath, newPath] = line.trim().split(/\s+/);
          const fileStatus = this.getFileStatus(status.trim());

          const fileInfo = {
            path: filePath,
            status: fileStatus,
            diff: this.getFileDiff(filePath),
            metadata: this.getFileMetadata(filePath, fileStatus)
          };

          if (status.startsWith('R') || status.startsWith('C')) {
            fileInfo.oldPath = filePath;
            fileInfo.path = newPath;
          }

          acc.push(fileInfo);
          return acc;
        }, []);
      } catch (error) {
        console.error('Error getting changed files:', error);
        return [];
      }
    }

    /**
     * Retrieves the number of lines added and removed for a specific file.
     * 
     * @param {string} filePath - The path of the file.
     * @returns {[string, string]} An array containing the number of lines added and removed.
     */
    getDiffStats(filePath) {
      try {
        const output = execSync(`git diff --numstat HEAD -- "${filePath}"`).toString().trim();
        const [added, removed] = output.split('\t');
        return [added || '0', removed || '0'];
      } catch (error) {
        if (error.status === 128) {
          // File is new and not in the last commit
          return ['All', '0'];
        }
        console.error(`Error getting diff stats for ${filePath}:`, error);
        return ['0', '0'];
      }
    }

    /**
     * Retrieves comprehensive file changes for all changed files.
     * 
     * @returns {Array<Object>} An array of objects containing detailed information about each changed file.
     */
    getFileChanges() {
      const changedFiles = this.getChangedFiles();
      return changedFiles.map(fileInfo => {
        let originalContent = '';
        let currentContent = '';

        try {
          if (fileInfo.status === 'modified' || fileInfo.status === 'renamed') {
            originalContent = this.getOriginalFileContent(fileInfo.path);
            currentContent = fs.readFileSync(fileInfo.path, 'utf-8');
          } else if (fileInfo.status === 'new' || fileInfo.status === 'untracked') {
            currentContent = fs.readFileSync(fileInfo.path, 'utf-8');
          } else if (fileInfo.status === 'deleted') {
            originalContent = this.getOriginalFileContent(fileInfo.path);
          }
        } catch (error) {
          console.error(`Error reading file content for ${fileInfo.path}:`, error);
        }

        return {
          ...fileInfo,
          originalContent,
          currentContent,
          diff: this.truncateDiff(fileInfo.diff, 1000)
        };
      });
    }
    
    /**
     * Retrieves the original content of a file from the last commit.
     * 
     * @param {string} file - The path of the file.
     * @returns {string} The original content of the file or an empty string if the file is new.
     */
    getOriginalFileContent(file) {
      try {
        const content = execSync(`git show HEAD:"${file}"`, { encoding: 'utf-8' });
        return content.trim();
      } catch (error) {
        if (error.status === 128) {
          // File is new and not in the last commit
          return '';
        }
        console.error(`Error retrieving original content for ${file}:`, error);
        throw error; // Re-throw unexpected errors
      }
    }
    
    /**
     * Retrieves the diff of a file compared to the HEAD.
     * 
     * @param {string} file - The path of the file.
     * @returns {string} The diff of the file or an empty string if there's an error.
     */
    getFileDiff(file) {
      try {
        return execSync(`git diff HEAD -- "${file}"`).toString();
      } catch (error) {
        console.error(`Error getting diff for ${file}:`, error);
        return '';
      }
    }
    
    /**
     * Truncates a diff string to a specified maximum length.
     * 
     * @param {string} diff - The diff string to truncate.
     * @param {number} [maxLength=1000] - The maximum length of the truncated diff.
     * @returns {string} The truncated diff string.
     */
    truncateDiff(diff, maxLength = 1000) {
      if (!diff) return '';
      if (diff.length <= maxLength) return diff;
      return diff.substring(0, maxLength) + '...';
    }

    /**
     * Retrieves the OpenAI API key from environment variables or a config file.
     * If not found, prompts the user to enter it.
     * 
     * @returns {Promise<string>} The OpenAI API key.
     * @example
     * const apiKey = await customPushProcess.getOpenAiApiKey();
     * console.log('API Key:', apiKey);
     */
    async getOpenAiApiKey() {
      if (process.env.OPENAI_API_KEY) {
        return process.env.OPENAI_API_KEY;
      }

      const configPath = path.join(process.env.HOME, '.openai_config');
      if (fs.existsSync(configPath)) {
        try {
          const configContent = fs.readFileSync(configPath, 'utf8');
          const apiKey = configContent.trim();
          if (apiKey.startsWith('sk-')) {
            return apiKey;
          }
        } catch (error) {
          console.error('Error reading OpenAI config:', error);
        }
      }

      const apiKey = await this.promptForOpenAiApiKey();
      
      if (apiKey) {
        try {
          fs.writeFileSync(configPath, apiKey, { mode: 0o600 });
          console.log(chalk.green('OpenAI API Key saved for future use.'));
        } catch (error) {
          console.error('Error saving OpenAI config:', error);
        }
      }

      return apiKey;
    }

    /**
     * Prompts the user to enter their OpenAI API key and saves it for future use.
     * 
     * @returns {Promise<string>} The entered OpenAI API key.
     * @example
     * const apiKey = await customPushProcess.promptForOpenAiApiKey();
     * console.log('Entered API Key:', apiKey);
     */
    async promptForOpenAiApiKey() {
      const { apiKey } = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: 'Enter your OpenAI API Key:',
          validate: input => input.startsWith('sk-') || 'Invalid API Key format'
        }
      ]);

      const configPath = path.join(process.env.HOME, '.openai_config');
      fs.writeFileSync(configPath, apiKey, { mode: 0o600 });
      console.log(chalk.green('OpenAI API Key saved for future use.'));

      return apiKey;
    }

    /**
     * Generates a directory structure object, excluding specified directories.
     * 
     * @returns {Object} An object representing the directory structure.
     * @example
     * const structure = customPushProcess.getDirectoryStructure();
     * console.log('Project structure:', JSON.stringify(structure, null, 2));
     */
    getDirectoryStructure() {
      const ignoreDirs = fs.readFileSync('.gitignore', 'utf8')
        .split('\n')
        .filter(line => line.trim() !== '' && !line.startsWith('#'))
        .map(line => line.trim().replace(/^\//, ''));
      const structure = {};
    
      function readDir(dir, obj) {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          if (ignoreDirs.includes(item)) continue;
          const path = `${dir}/${item}`;
          if (fs.statSync(path).isDirectory()) {
            obj[item] = {};
            readDir(path, obj[item]);
          } else {
            obj[item] = null;
          }
        }
      }
    
      readDir('.', structure);
      return structure;
    }

    /**
     * Splits an array into smaller chunks of a specified size.
     * 
     * @param {Array} array - The array to be split into chunks.
     * @param {number} chunkSize - The size of each chunk.
     * @returns {Array<Array>} An array of chunks, where each chunk is an array of elements from the original array.
     * @example
     * const originalArray = [1, 2, 3, 4, 5, 6, 7, 8];
     * const chunkedArray = splitIntoChunks(originalArray, 3);
     * // Result: [[1, 2, 3], [4, 5, 6], [7, 8]]
     */
    splitIntoChunks(array, chunkSize) {
      if (!array || array.length === 0) return [];
      const chunks = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
      }
      return chunks;
    }

    /**
     * Retrieves the README file content.
     * @returns {string} The content of the README file or an empty string if an error occurs.
     */
    getReadme() {
      try {
        return fs.readFileSync('README.md', 'utf8');
      } catch (error) {
        return '';
      }
    }

    /**
     * Retrieves the project context including directory structure, package.json info, Git info, and recent commits.
     * @returns {Object} An object containing project context information.
     */
    getProjectContext() {
      const projectContext = {
        structure: this.getDirectoryStructure(),
        packageJson: this.getPackageJsonInfo(),
        readme: this.getReadme(),
        gitInfo: this.getGitInfo(),
        recentCommits: this.getRecentCommits(),
      };
      return projectContext;
    }

    /**
     * Retrieves information from the package.json file.
     * @returns {Object} An object containing package.json information or an empty object if an error occurs.
     */
    getPackageJsonInfo() {
      try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        return {
          name: packageJson.name,
          version: packageJson.version,
          description: packageJson.description,
          dependencies: Object.keys(packageJson.dependencies || {}),
          devDependencies: Object.keys(packageJson.devDependencies || {})
        };
      } catch (error) {
        console.error('Error reading package.json:', error);
        return {};
      }
    }

    /**
     * Retrieves Git information including the current branch and remote URL.
     * @returns {Object} An object containing Git information or an empty object if an error occurs.
     */
    getGitInfo() {
      try {
        const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        const remoteUrl = execSync('git config --get remote.origin.url').toString().trim();
        return { currentBranch, remoteUrl };
      } catch (error) {
        console.error('Error getting Git info:', error);
        return {};
      }
    }

    /**
     * Retrieves recent Git commits.
     * @param {number} [limit=5] - The number of recent commits to retrieve.
     * @returns {Array<Object>} An array of objects containing commit information or an empty array if an error occurs.
     */
    getRecentCommits(count) {
      try {
        const output = execSync(`git log -n ${count} --pretty=format:"%h|%s|%an|%ad"`).toString().trim();
        if (!output) {
          return [];
        }
        return output.split('\n').map(line => {
          const [hash, subject, author, date] = line.split('|');
          return { hash, subject, author, date };
        });
      } catch (error) {
        console.error('Error fetching recent commits:', error instanceof Error ? error.message : String(error));
        return [];
      }
    }

    /**
     * Generates AI-suggested branches and commits based on changed files.
     * 
     * @param {string} [userContext=''] - Additional context provided by the user.
     * @returns {Promise<Object>} An object containing suggested branches and commits.
     * @throws {Error} If there's an issue generating suggestions.
     */
    async getAIBranchesAndCommits(userContext = '') {
      const spinner = ora('🤖 Analyzing changes and generating suggestions...').start();
      try {
        const projectContext = this.getProjectContext();
        const changedFiles = this.getChangedFiles();
        
        // Reduce the size of the project context
        const reducedProjectContext = {
          name: projectContext.packageJson?.name || '',
          description: projectContext.packageJson?.description?.slice(0, 200) || '',
          recentCommits: projectContext.recentCommits,
          mainDirectories: Object.keys(projectContext.structure),
          readme: projectContext.readme,
        };
    
        // Prepare file changes with concise summaries
        const preparedFileChanges = changedFiles.map(file => ({
          path: file.path,
          status: file.status,
          summary: this.summarizeChanges(file.diff, 150),
          metadata: file.metadata
        }));
    
        // Split the changes into chunks
        const chunks = this.splitIntoChunks(preparedFileChanges, 5); // 5 files per chunk
    
        let allAnalysis = [];
        
        for (const chunk of chunks) {
          const chunkAnalysis = await this.getAIAnalysisForChunk(reducedProjectContext, chunk, userContext);
          allAnalysis.push(...chunkAnalysis);
        }
        
        // Generate final suggestions based on all analyses
        const finalSuggestions = await this.getFinalAISuggestions(reducedProjectContext, allAnalysis, userContext);
    
        spinner.succeed(chalk.green('AI analysis and suggestions generated successfully!'));
        return finalSuggestions;
      } catch (error) {
        spinner.fail(chalk.red('Failed to generate AI analysis and suggestions'));
        console.error(chalk.red(error));
        throw error;
      }
    }

    /**
     * Summarizes the changes in a git diff.
     * @param {string} diff - The git diff string to summarize.
     * @param {number} maxLength - The maximum length of the summary.
     * @returns {string} A summary of the changes, including lines added and removed.
     */
    summarizeChanges(diff, maxLength) {
      const lines = diff.split('\n');
      const addedLines = lines.filter(line => line.startsWith('+')).length;
      const removedLines = lines.filter(line => line.startsWith('-')).length;
      return `${addedLines} lines added, ${removedLines} lines removed`.slice(0, maxLength);
    }
    
    /**
     * Retrieves the main directories of the project.
     * @returns {string[]} An array of directory names in the project root.
     */
    getMainDirectories() {
      return fs.readdirSync('.', { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    }

    /**
     * Analyzes a chunk of file changes using AI.
     * 
     * @param {Object} reducedProjectContext - Reduced context information about the project.
     * @param {Array<Object>} fileChangesChunk - A chunk of file changes to analyze.
     * @param {string} userContext - Additional context provided by the user.
     * @returns {Promise<Array<Object>>} An array of objects containing analysis for each file.
     */
    async getAIAnalysisForChunk(reducedProjectContext, fileChangesChunk, userContext) {
      const openai = createOpenAI({ apiKey: this.openAiApiKey });
  
      const { object } = await generateObject({
        model: openai('gpt-4o'),
        schema: z.object({
          files: z.array(z.object({
            path: z.string(),
            summary: z.string(),
            impact: z.string()
          }))
        }),
        prompt: `Analyze the following file changes in the context of the project:

        Project Context:
        ${JSON.stringify(reducedProjectContext, null, 2)}

        File Changes:
        ${JSON.stringify(fileChangesChunk, null, 2)}

        User Context: ${userContext}

        For each file, provide a brief summary of the changes and assess their impact on the project.
        Focus on the most significant changes and their implications for the project's functionality, architecture, or performance.
        Consider the file status (new, modified, deleted), the number of lines added and removed, and the file type.`
      });
  
      return object.files;
    }
  
    /**
     * Generates final AI suggestions for branches and commits based on all changes.
     * 
     * @param {Object} projectContext - Context information about the project.
     * @param {Array<Object>} allChanges - All analyzed file changes.
     * @param {string} userContext - Additional context provided by the user.
     * @returns {Promise<Object>} An object containing suggested branches and commits.
     */
    async getFinalAISuggestions(projectContext, allChanges, userContext) {
      const openai = createOpenAI({ apiKey: this.openAiApiKey });
  
      const { object } = await generateObject({
        model: openai('gpt-4o'),
        schema: z.object({
          branches: z.array(z.object({
            name: z.string(),
            description: z.string(),
            commits: z.array(z.object({
              message: z.string(),
              files: z.array(z.string())
            }))
          }))
        }),
        prompt: `Based on the following project context and file changes, generate appropriate Git branches and commits for the current changes:
  
        Project Context: 
        ${JSON.stringify(projectContext)}

        User context: 
        ${userContext}

        All Changes: 
        ${JSON.stringify(allChanges)}
  
        Guidelines:
        1. Create branches that logically group related changes.
        2. Branch names should follow the format: <type>/<scope>/<detailed-description>
           Types can include: feature, fix, refactor, docs, style, test, chore, etc.
        3. Commit messages must follow the conventional commits format: <type>(<scope>): <detailed description>
        4. Group related changes into logical commits within each branch.
        5. Consider the scope and impact of changes when deciding on the branch and commit structure.
        6. Provide a brief description for each branch to explain its purpose.
        7. Ensure that the branches and commits accurately reflect the nature and scope of the changes, whether they are new features, bug fixes, refactoring, or any other type of update.
  
        Generate a JSON object with appropriate branches and commits based on these guidelines, ensuring they accurately reflect the nature and scope of all the changes in the current update.`
      });
  
      return object;
    }

    /**
     * Allows the user to edit AI-generated suggestions interactively.
     * 
     * @param {Object} suggestions - The AI-generated suggestions.
     * @returns {Promise<Object>} The edited suggestions.
     */
    async editAISuggestions(suggestions) {
      const editedSuggestions = JSON.parse(JSON.stringify(suggestions)); // Deep copy

      console.log(chalk.cyan('\nCurrent suggestions:'));
      await this.displaySuggestions(editedSuggestions);

      const { editChoice } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'editChoice',
          message: 'Do you want to edit these suggestions?',
          default: false
        }
      ]);

      if (!editChoice) {
        return suggestions;
      }

      const { userFeedback } = await inquirer.prompt([
        {
          type: 'input',
          name: 'userFeedback',
          message: 'Please provide feedback on what should be changed in the suggestions:',
        }
      ]);

      if (userFeedback) {
        const updatedSuggestions = await this.regenerateSuggestions(editedSuggestions, userFeedback);
        console.log(chalk.cyan('\nUpdated suggestions based on your feedback:'));
        await this.displaySuggestions(updatedSuggestions);

        const { confirmChoice } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmChoice',
            message: 'Are you satisfied with these updated suggestions?',
            default: true
          }
        ]);

        if (confirmChoice) {
          return updatedSuggestions;
        }
      }

      // If the user is not satisfied or didn't provide feedback, proceed with manual editing
      for (let i = 0; i < editedSuggestions.branches.length; i++) {
        const branch = editedSuggestions.branches[i];
        const { branchName, branchDescription } = await inquirer.prompt([
          {
            type: 'input',
            name: 'branchName',
            message: `Edit branch name:`,
            default: branch.name
          },
          {
            type: 'input',
            name: 'branchDescription',
            message: `Edit branch description:`,
            default: branch.description
          }
        ]);

        branch.name = branchName;
        branch.description = branchDescription;

        for (let j = 0; j < branch.commits.length; j++) {
          const commit = branch.commits[j];
          const { commitMessage } = await inquirer.prompt([
            {
              type: 'input',
              name: 'commitMessage',
              message: `Edit commit message:`,
              default: commit.message
            }
          ]);

          commit.message = commitMessage;
        }
      }

      console.log(chalk.cyan('\nUpdated suggestions:'));
      await this.displaySuggestions(editedSuggestions);

      const { confirmChoice } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmChoice',
          message: 'Do you want to proceed with these changes?',
          default: true
        }
      ]);

      return confirmChoice ? editedSuggestions : suggestions;
    }

    /**
     * Regenerates suggestions based on user feedback.
     * 
     * @param {Object} originalSuggestions - The original AI-generated suggestions.
     * @param {string} userFeedback - User's feedback on what should be changed.
     * @returns {Promise<Object>} Updated suggestions based on user feedback.
     */
    async regenerateSuggestions(originalSuggestions, userFeedback) {
      const openai = createOpenAI({ apiKey: this.openAiApiKey });

      const { object } = await generateObject({
        model: openai('gpt-4o'),
        schema: z.object({
          branches: z.array(z.object({
            name: z.string(),
            description: z.string(),
            commits: z.array(z.object({
              message: z.string(),
              files: z.array(z.string())
            }))
          }))
        }),
        prompt: `Based on the following original suggestions and user feedback, generate updated Git branches and commits:

        Original Suggestions:
        ${JSON.stringify(originalSuggestions, null, 2)}

        User Feedback:
        ${userFeedback}

        Please update the suggestions according to the user's feedback. Ensure that the updated suggestions still follow the original guidelines for branch names and commit messages.

        Generate a JSON object with the updated branches and commits, addressing the user's feedback while maintaining the overall structure and conventions.`
      });

      return object;
    }

    /**
     * Displays the AI-generated suggestions for branches and commits.
     * 
     * @param {Object} suggestions - The object containing branch and commit suggestions.
     * @param {Array} suggestions.branches - An array of branch objects.
     * @param {string} suggestions.branches[].name - The name of the branch.
     * @param {string} suggestions.branches[].description - The description of the branch.
     * @param {Array} suggestions.branches[].commits - An array of commit objects for the branch.
     * @param {string} suggestions.branches[].commits[].message - The commit message.
     * @param {Array} suggestions.branches[].commits[].files - An array of file paths affected by the commit.
     * @returns {Promise<void>}
     */
    async displaySuggestions(suggestions) {
      if (!suggestions || !suggestions.branches) {
        console.error('No valid suggestions available to display.');
        return;
      }

      console.log(chalk.bold.cyan('AI Suggestions'));
    
      suggestions.branches.forEach((branch, index) => {
        console.log(chalk.bold.green(`\nBranch ${index + 1}: ${branch.name}`));
        console.log(chalk.yellow(`Description: ${branch.description}`));
        console.log(chalk.cyan('Commits:'));
    
        branch.commits.forEach((commit, commitIndex) => {
          console.log(chalk.white(`  ${commitIndex + 1}. ${commit.message}`));
          console.log(chalk.gray(`     Files:`));
          commit.files.forEach(file => {
            console.log(chalk.gray(`       - ${file}`));
          });
          console.log(); // Add an empty line between commits
        });
    
        console.log(chalk.gray('---')); // Add a separator between branches
      });
    
      console.log(chalk.cyan('End of Suggestions'));
    }

    /**
     * Implements the suggested changes by creating branches and commits.
     * 
     * @param {Object} suggestions - The object containing branch and commit suggestions.
     * @param {Array} suggestions.branches - An array of branch objects.
     * @param {string} suggestions.branches[].name - The name of the branch.
     * @param {string} suggestions.branches[].description - The description of the branch.
     * @param {Array} suggestions.branches[].commits - An array of commit objects for the branch.
     * @param {string} suggestions.branches[].commits[].message - The commit message.
     * @param {Array} suggestions.branches[].commits[].files - An array of file paths affected by the commit.
     * @returns {Promise<void>} A promise that resolves when all changes have been implemented.
     * @throws {Error} If there's an issue creating branches or commits.
     */
    async implementChanges(suggestions) {
      const originalBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
      console.log(chalk.cyan(`Original branch: ${originalBranch}`));
    
      // Check commitlint configuration
      try {
        const commitlintConfig = await execAsync('npx commitlint --print-config');
        console.log(chalk.cyan('Commitlint configuration:'));
        console.log(commitlintConfig.stdout);
      } catch (error) {
        console.warn(chalk.yellow('Unable to print commitlint configuration. It might not be installed or configured properly.'));
      }

      for (const branch of suggestions.branches) {
        const branchSpinner = ora(`Creating/switching to branch: ${branch.name}`).start();
        try {
          // Check if the branch exists
          const branchExists = await execAsync(`git show-ref --verify --quiet refs/heads/${branch.name}`).then(() => true).catch(() => false);
          
          if (branchExists) {
            await execAsync(`git checkout ${branch.name}`);
            branchSpinner.succeed(chalk.green(`Switched to existing branch: ${branch.name}`));
          } else {
            await execAsync(`git checkout -b ${branch.name}`);
            branchSpinner.succeed(chalk.green(`Branch created: ${branch.name}`));
          }

          console.log();
          console.log(chalk.bold.cyan(`Branch: ${branch.name}`));
          console.log(chalk.yellow(`Description: ${branch.description}`));
          console.log();

          // Log Git configuration
          console.log(chalk.cyan('Git configuration:'));
          const gitConfig = await execAsync('git config --list');
          console.log(gitConfig.stdout);

          for (const commit of branch.commits) {
            const commitSpinner = ora(`Creating commit: ${commit.message}`).start();
            try {
              await execAsync('git add -A');
              
              const status = await execAsync('git status --porcelain');
              if (!status.stdout.trim()) {
                commitSpinner.warn(chalk.yellow(`No changes to commit for: ${commit.message}`));
                continue;
              }

              // Validate commit message with commitlint
              try {
                await execAsync(`echo "${commit.message}" | npx commitlint`);
                console.log(chalk.green('Commit message passed commitlint validation.'));
              } catch (commitlintError) {
                console.warn(chalk.yellow('Commit message failed commitlint validation. Attempting commit anyway...'));
                console.error(commitlintError.stderr);
              }

              // Try to commit
              try {
                await execAsync(`git commit -m "${commit.message}"`);
                commitSpinner.succeed(chalk.green(`Commit created: ${commit.message}`));
              } catch (commitError) {
                console.error(chalk.red('Error during commit:'), commitError);
                console.log(chalk.yellow('Attempting commit with --no-verify...'));
                await execAsync(`git commit --no-verify -m "${commit.message}"`);
                commitSpinner.succeed(chalk.green(`Commit created (no-verify): ${commit.message}`));
              }
              
              // Log the commit details
              const logOutput = await execAsync('git log -1 --stat');
              console.log(chalk.cyan('Commit details:'));
              console.log(logOutput.stdout);
            } catch (error) {
              commitSpinner.fail(chalk.red(`Failed to create commit: ${commit.message}`));
              console.error(chalk.red('Error details:'), error);
              console.log(chalk.cyan('Current Git status after error:'));
              const statusOutput = await execAsync('git status --short');
              console.log(statusOutput.stdout);
            }
          }
    
          const pushSpinner = ora(`Pushing branch: ${branch.name}`).start();
          try {
            await execAsync(`git push -u origin ${branch.name}`);
            pushSpinner.succeed(chalk.green(`Branch pushed: ${branch.name}`));
          } catch (error) {
            pushSpinner.fail(chalk.red(`Failed to push branch: ${branch.name}`));
            console.error(chalk.red('Error details:'), error);
          }
        } catch (error) {
          branchSpinner.fail(chalk.red(`Failed to create/switch to branch: ${branch.name}`));
          console.error(chalk.red('Error details:'), error);
        }
      }
      
      // Switch back to the original branch
      const finalSpinner = ora(`Switching back to original branch: ${originalBranch}`).start();
      try {
        await execAsync(`git checkout ${originalBranch}`);
        finalSpinner.succeed(chalk.green(`Switched back to original branch: ${originalBranch}`));
      } catch (error) {
        finalSpinner.fail(chalk.red(`Failed to switch back to the original branch: ${originalBranch}`));
        console.error(chalk.red('Error details:'), error);
      }
    
      // Final status check
      console.log(chalk.cyan('Final Git status:'));
      console.log(execSync('git status --short').toString());
    }

    /**
     * The main method that orchestrates the entire custom push process.
     * 
     * @returns {Promise<void>}
     */
    async main() {
      console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.cyan.bold('Shadcn/UI Theme Creator'));
      console.log(chalk.cyan('Custom Push Process for Chrome Extension'));
      console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.cyan('Author: Felipe Barcelos (felipe.barcelospro@gmail.com)'));
      console.log(chalk.cyan('Repo: https://github.com/felipebarcelospro/shadcn-theme-creator'));
      console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log();

      try {
        this.openAiApiKey = await this.getOpenAiApiKey();

        if (!this.openAiApiKey) {
          console.log(chalk.red('OpenAI API Key is required to proceed.'));
          return;
        }

        console.log(chalk.cyan('📌 Current branch: ') + chalk.yellow(execSync('git rev-parse --abbrev-ref HEAD').toString().trim()));
        console.log();

        const changedFiles = this.getChangedFiles();

        console.log(chalk.cyan('📄 Changed files:'));
        console.log(chalk.yellow(`   Total files: ${changedFiles.length}`));
        console.log(chalk.yellow(`   Types: ${[...new Set(changedFiles.map(file => file.metadata.fileType || 'no extension'))].join(', ')}`));
        console.log();

        changedFiles.forEach(file => {
          const statusColor = file.status === 'new' ? chalk.green : file.status === 'modified' ? chalk.yellow : chalk.red;
          console.log(statusColor(`   ${file.status.charAt(0).toUpperCase() + file.status.slice(1)}: ${file.path}`));
          console.log(chalk.gray(`     Lines added: ${file.metadata.linesAdded}, Lines removed: ${file.metadata.linesRemoved}`));
          console.log();
        });

        const { userContext } = await inquirer.prompt([
          {
            type: 'input',
            name: 'userContext',
            message: 'Enter any additional context for the AI (optional):',
          }
        ]);

        const aiSuggestions = await this.getAIBranchesAndCommits(userContext);

        await this.displaySuggestions(aiSuggestions);

        const editedSuggestions = await this.editAISuggestions(aiSuggestions);

        const { proceed } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'Do you want to proceed with these changes?',
            default: true
          }
        ]);

        if (!proceed) {
          console.log(chalk.red('Process aborted by user.'));
          return;
        }

        await this.implementChanges(editedSuggestions);

        console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log(chalk.bold.cyan('🎉 Custom push process completed successfully!'));
        console.log(chalk.cyan('Summary of Changes:'));        
        console.log(chalk.cyan(`• Files Analyzed: ${chalk.green(changedFiles.length)}`));
        console.log(chalk.cyan(`• Branches Created: ${chalk.green(editedSuggestions.branches.length)}`));
        editedSuggestions.branches.forEach((branch, index) => {
          console.log(chalk.cyan(`  ${index + 1}. Branch Name: ${chalk.green(branch.name)}`));
          console.log(chalk.cyan(`     Link: ${chalk.yellow(`https://github.com/felipebarcelospro/shadcn-theme-creator-for-chrome/tree/${branch.name}`)}`));
          branch.commits.forEach((commit, commitIndex) => {
            console.log(chalk.cyan(`     ${commitIndex + 1}. Commit Message: ${chalk.green(commit.message)}`));
          });
        });
      } catch (error) {
        console.error(chalk.red.bold('❌ Error in custom push process:'));
        console.error(chalk.red(error));
      }
    }
  }

  return new CustomPushProcess();
}

/**
 * The main function that initializes and runs the custom push process.
 * It ensures that the 'ora' module is loaded before starting the process.
 * 
 * @returns {Promise<void>}
 * @example
 * main().catch(console.error);
 */
async function main() {
  try {
    await import('ora');
    await import('inquirer');
    
    const customPushProcess = createCustomPushProcess();
    await customPushProcess.main();
  } catch (error) {
    console.error(chalk.red.bold('❌ Unhandled error in main process:'));
    console.error(chalk.red(error));
  }
}

main().catch(console.error);
