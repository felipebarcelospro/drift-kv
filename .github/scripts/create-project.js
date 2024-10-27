const { Octokit } = require('@octokit/rest');
const core = require('@actions/core');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

async function createOrGetProject() {
  const owner = process.env.OWNER;
  const repo = process.env.REPO;

  try {
    console.log('Looking for existing project...');
    // First, try to find existing project
    const { data: projects } = await octokit.projects.listForRepo({
      owner,
      repo,
      state: 'open'
    });

    const existingProject = projects.find(
      project => project.name === 'Drift KV Development Roadmap'
    );

    if (existingProject) {
      console.log('Project already exists');
      core.setOutput('project_id', existingProject.id);
      return;
    }

    console.log('Creating new project...');
    // If not found, create new project
    const { data: newProject } = await octokit.projects.createForRepo({
      owner,
      repo,
      name: 'Drift KV Development Roadmap',
      body: 'Development roadmap and task tracking for Drift KV'
    });

    console.log('Project created successfully');
    core.setOutput('project_id', newProject.id);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createOrGetProject().catch(error => {
  console.error('❌ Unhandled error:');
  console.error(error);
  process.exit(1);
});