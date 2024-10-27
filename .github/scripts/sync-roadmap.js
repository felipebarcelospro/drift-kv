import { Octokit } from '@octokit/rest';
import fs from 'fs';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const owner = process.env.GITHUB_REPOSITORY.split('/')[0];
const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
const projectId = process.env.PROJECT_ID;

async function syncRoadmap() {
  const roadmapContent = fs.readFileSync('ROADMAP.md', 'utf8');
  const contentRoadmapContent = fs.readFileSync('CONTENT_ROADMAP.md', 'utf8');

  const roadmapJson = JSON.parse(roadmapContent.match(/```json\n([\s\S]*?)\n```/)[1]);
  const contentRoadmapJson = JSON.parse(contentRoadmapContent.match(/```json\n([\s\S]*?)\n```/)[1]);

  // Sync development tasks
  for (const group of roadmapJson.developmentGroups) {
    for (const task of group.tasks) {
      await createOrUpdateIssue(task, group.name);
    }
  }

  // Sync content tasks
  for (const category of contentRoadmapJson.contentCategories) {
    for (const item of category.items) {
      await createOrUpdateIssue(item, category.name);
    }
  }
}

async function createOrUpdateIssue(task, category) {
  const title = task.name || task.title;
  const body = `${task.description || ''}\n\nCategory: ${category}\nPriority: ${task.priority || 'N/A'}\nComplexity: ${task.complexity || 'N/A'}\nStatus: ${task.status}`;

  const labels = [
    category,
    `priority:${task.priority || 'medium'}`,
    `complexity:${task.complexity || 'medium'}`,
    `status:${task.status || 'planned'}`,
    ...(task.labels || [])
  ];

  try {
    const existingIssue = await octokit.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      labels: [category],
    });

    const issue = existingIssue.data.find(i => i.title === title);

    if (issue) {
      await octokit.issues.update({
        owner,
        repo,
        issue_number: issue.number,
        title,
        body,
        labels,
        state: task.status === 'completed' ? 'closed' : 'open',
      });
    } else {
      const newIssue = await octokit.issues.create({
        owner,
        repo,
        title,
        body,
        labels,
      });

      // Add issue to project
      await octokit.graphql(`
        mutation {
          addProjectV2ItemById(input: {projectId: "${projectId}" contentId: "${newIssue.data.node_id}"}) {
            item {
              id
            }
          }
        }
      `);
    }

  } catch (error) {
    console.error(`Error processing task "${title}":`, error);
  }
}

syncRoadmap().catch(console.error);
