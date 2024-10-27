import { Octokit } from "@octokit/rest";

/**
 * Repository information interface
 */
export interface RepositoryInfo {
  name: string;
  description: string;
  starCount: number;
  forkCount: number;
  issueCount: number;
  updatedAt: string;
}

/**
 * Repository contributor interface
 */
export interface RepositoryContributor {
  username: string;
  avatarUrl: string;
  contributionCount: number;
}

/**
 * Repository release interface
 */
export interface RepositoryRelease {
  id: number;
  title: string;
  description: string;
  publishDate: string | null;
  version: string;
}

/**
 * Class for interacting with GitHub API to fetch repository information.
 */
export class GitHubService {
  private readonly owner: string;
  private readonly repo: string;
  private readonly octokit: Octokit;

  constructor() {
    this.owner = "felipebarcelospro";
    this.repo = "drift";

    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
      request: {
        next: {
          revalidate: 15 * 60,
          tags: ["github-api"],
        },
      },
    });
  }

  /**
   * Fetches repository information
   */
  public async getRepositoryInfo(): Promise<RepositoryInfo> {
    const data = await this.octokit.rest.repos.get({
      owner: this.owner,
      repo: this.repo,
    });

    return {
      name: data.data.name,
      description: data.data.description || "",
      starCount: data.data.stargazers_count,
      forkCount: data.data.forks_count,
      issueCount: data.data.open_issues_count,
      updatedAt: data.data.updated_at,
    };
  }

  /**
   * Fetches repository contributors
   */
  public async getRepositoryContributors(): Promise<RepositoryContributor[]> {
    const data = await this.octokit.rest.repos.listContributors({
      owner: this.owner,
      repo: this.repo,
    });

    console.log(data.data);

    const contributors: RepositoryContributor[] = [];

    if (!Array.isArray(data)) {
      return contributors;
    }

    // Get repo owner info if not in contributors list
    const ownerExists = data.some((c) => c.login === this.owner);
    if (!ownerExists) {
      const ownerData = await this.octokit.rest.users.getByUsername({
        username: this.owner,
      });

      contributors.push({
        username: this.owner,
        avatarUrl: ownerData.data.avatar_url || "",
        contributionCount: 0,
      });
    }

    // Add other contributors
    for (const contributor of data) {
      contributors.push({
        username: contributor.login || "",
        avatarUrl: contributor.avatar_url || "",
        contributionCount: contributor.contributions || 0,
      });
    }

    return contributors;
  }

  /**
   * Fetches repository releases
   */
  public async getRepositoryReleases(): Promise<RepositoryRelease[]> {
    const data = await this.octokit.rest.repos.listReleases({
      owner: this.owner,
      repo: this.repo,
    });

    return data.data.map((release) => ({
      id: release.id,
      title: release.name || release.tag_name,
      description: release.body || "",
      publishDate: release.published_at,
      version: release.tag_name,
    }));
  }
}

export const githubService = new GitHubService();
