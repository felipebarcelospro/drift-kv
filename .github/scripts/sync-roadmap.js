const { Octokit } = require('@octokit/rest');
const fs = require('fs');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const owner = process.env.OWNER;
const repo = process.env.REPO;
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
    const { data: existingIssues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      labels: [category],
    });

    const issue = existingIssues.find(i => i.title === title);

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
      const { data: newIssue } = await octokit.issues.create({
        owner,
        repo,
        title,
        body,
        labels,
      });

      // Add issue to project using REST API
      await octokit.projects.createCard({
        project_id: projectId,
        content_id: newIssue.id,
        content_type: 'Issue'
      });
    }

  } catch (error) {
    console.error(`Error processing task "${title}":`, error);
  }
}

syncRoadmap().catch(console.error);
