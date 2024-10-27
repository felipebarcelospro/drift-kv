const { graphql } = require('@octokit/graphql');
const core = require('@actions/core');

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
  },
});

async function createOrGetProject() {
  const owner = process.env.GITHUB_REPOSITORY.split('/')[0];
  const repo = process.env.GITHUB_REPOSITORY.split('/')[1];

  try {
    console.log('Looking for existing project...');
    // First, try to find existing project
    const { repository } = await graphqlWithAuth(`
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          projectsV2(first: 10) {
            nodes {
              id
              title
            }
          }
        }
      }
    `, { owner, repo });

    const existingProject = repository.projectsV2.nodes.find(
      project => project.title === 'Drift KV Development Roadmap'
    );

    if (existingProject) {
      console.log('Project already exists');
      core.setOutput('project_id', existingProject.id);
      return;
    }

    console.log('Creating new project...');
    // If not found, create new project
    const { createProjectV2 } = await graphqlWithAuth(`
      mutation($owner: String!, $title: String!) {
        createProjectV2(input: {
          ownerId: $owner
          title: $title
          repositoryId: $repo
        }) {
          projectV2 {
            id
          }
        }
      }
    `, {
      owner,
      title: 'Drift KV Development Roadmap'
    });

    console.log('Project created successfully');
    core.setOutput('project_id', createProjectV2.projectV2.id);

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