/**
 * GitHub API Integration Service
 * Handles fetching repository data from GitHub REST API
 */

import axios from 'axios';
import type { GitHubRepo, GitHubFile, GitHubTreeItem, RepoContext } from '@/types';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Get GitHub token from environment
 */
function getGitHubToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is not configured');
  }
  return token;
}

/**
 * Get GitHub API headers with authentication
 */
function getHeaders() {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `Bearer ${getGitHubToken()}`,
  };
  return headers;
}

/**
 * Parse GitHub repository URL to extract owner and repo name
 */
export function parseRepoUrl(url: string): GitHubRepo | null {
  try {
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+)/,
      /^([^\/]+)\/([^\/]+)$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const owner = match[1];
        const name = match[2].replace(/\.git$/, '');
        return {
          owner,
          name,
          url: `https://github.com/${owner}/${name}`,
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error parsing repo URL:', error);
    return null;
  }
}

/**
 * Fetch repository information
 */
export async function fetchRepoInfo(owner: string, repo: string): Promise<any> {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;
    const response = await axios.get(url, { headers: getHeaders() });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Repository not found');
    }
    throw new Error(`Failed to fetch repository info: ${error.message}`);
  }
}

/**
 * Fetch repository languages
 */
export async function fetchLanguages(owner: string, repo: string): Promise<Record<string, number>> {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`;
    const response = await axios.get(url, { headers: getHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error fetching languages:', error);
    return {};
  }
}

/**
 * Fetch recent commits
 */
export async function fetchCommits(owner: string, repo: string, count: number = 10): Promise<any[]> {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=${count}`;
    const response = await axios.get(url, { headers: getHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error fetching commits:', error);
    return [];
  }
}

/**
 * Fetch contributors
 */
export async function fetchContributors(owner: string, repo: string): Promise<any[]> {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors`;
    const response = await axios.get(url, { headers: getHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return [];
  }
}

/**
 * Fetch README content
 */
export async function fetchReadme(owner: string, repo: string): Promise<string> {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`;
    const response = await axios.get(url, { headers: getHeaders() });
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    return content;
  } catch (error) {
    console.error('Error fetching README:', error);
    return '';
  }
}

/**
 * Fetch the file tree from GitHub repository
 */
export async function fetchFileTree(
  owner: string,
  repo: string
): Promise<GitHubTreeItem[]> {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/main?recursive=1`;
    const response = await axios.get(url, { headers: getHeaders() });
    
    // Filter for relevant files only
    const relevantExtensions = ['.js', '.ts', '.tsx', '.jsx', '.json', '.py', '.java', '.go', '.rb', '.php', '.c', '.cpp', '.cs', '.swift', '.kt'];
    const tree = response.data.tree.filter((item: GitHubTreeItem) => {
      if (item.type !== 'blob') return false;
      return relevantExtensions.some(ext => item.path.endsWith(ext));
    });

    return tree;
  } catch (error: any) {
    if (error.response?.status === 404) {
      // Try 'master' branch if 'main' doesn't exist
      try {
        const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/master?recursive=1`;
        const response = await axios.get(url, { headers: getHeaders() });
        
        const relevantExtensions = ['.js', '.ts', '.tsx', '.jsx', '.json', '.py', '.java', '.go', '.rb', '.php', '.c', '.cpp', '.cs', '.swift', '.kt'];
        const tree = response.data.tree.filter((item: GitHubTreeItem) => {
          if (item.type !== 'blob') return false;
          return relevantExtensions.some(ext => item.path.endsWith(ext));
        });

        return tree;
      } catch (masterError) {
        throw new Error('Repository not found or branch not accessible');
      }
    }
    throw error;
  }
}

/**
 * Fetch raw file content from GitHub
 */
export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string> {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;
    const response = await axios.get(url, { headers: getHeaders() });
    
    // Content is base64 encoded
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    return content;
  } catch (error) {
    console.error(`Error fetching file ${path}:`, error);
    return '';
  }
}

/**
 * Fetch package.json if it exists
 */
export async function fetchPackageJson(
  owner: string,
  repo: string
): Promise<any | null> {
  try {
    const content = await fetchFileContent(owner, repo, 'package.json');
    return content ? JSON.parse(content) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetch requirements.txt if it exists
 */
export async function fetchRequirementsTxt(
  owner: string,
  repo: string
): Promise<string | null> {
  try {
    const content = await fetchFileContent(owner, repo, 'requirements.txt');
    return content || null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetch comprehensive repository data
 */
export async function fetchCompleteRepoData(repoUrl: string): Promise<any> {
  const repo = parseRepoUrl(repoUrl);
  
  if (!repo) {
    throw new Error('Invalid GitHub repository URL');
  }

  console.log(`Fetching repository: ${repo.owner}/${repo.name}`);

  try {
    // Fetch all data in parallel
    const [
      repoInfo,
      languages,
      commits,
      contributors,
      readme,
      fileTree,
      packageJson,
      requirementsTxt,
    ] = await Promise.all([
      fetchRepoInfo(repo.owner, repo.name),
      fetchLanguages(repo.owner, repo.name),
      fetchCommits(repo.owner, repo.name, 10),
      fetchContributors(repo.owner, repo.name),
      fetchReadme(repo.owner, repo.name),
      fetchFileTree(repo.owner, repo.name),
      fetchPackageJson(repo.owner, repo.name),
      fetchRequirementsTxt(repo.owner, repo.name),
    ]);

    // Calculate language percentages
    const totalBytes = Object.values(languages).reduce((sum: number, bytes: any) => sum + bytes, 0);
    const languageBreakdown = Object.entries(languages).map(([lang, bytes]: [string, any]) => ({
      language: lang,
      percentage: ((bytes / totalBytes) * 100).toFixed(1),
      bytes,
    }));

    // Format commits
    const formattedCommits = commits.map((commit: any) => ({
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      sha: commit.sha.substring(0, 7),
    }));

    // Format contributors
    const formattedContributors = contributors.map((contributor: any) => ({
      name: contributor.login,
      contributions: contributor.contributions,
      avatar: contributor.avatar_url,
    }));

    // Get dependencies
    let dependencies = null;
    if (packageJson?.dependencies) {
      dependencies = {
        type: 'npm',
        list: Object.entries(packageJson.dependencies).map(([name, version]) => ({
          name,
          version,
        })),
      };
    } else if (requirementsTxt) {
      dependencies = {
        type: 'pip',
        list: requirementsTxt.split('\n').filter(line => line.trim() && !line.startsWith('#')).map(line => {
          const [name, version] = line.split('==');
          return { name: name.trim(), version: version?.trim() || 'latest' };
        }),
      };
    }

    return {
      repo: {
        name: repoInfo.name,
        fullName: repoInfo.full_name,
        description: repoInfo.description || 'No description provided',
        url: repoInfo.html_url,
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        watchers: repoInfo.watchers_count,
        openIssues: repoInfo.open_issues_count,
        license: repoInfo.license?.name || 'No license',
        defaultBranch: repoInfo.default_branch,
        createdAt: repoInfo.created_at,
        updatedAt: repoInfo.updated_at,
      },
      languages: {
        primary: languageBreakdown[0]?.language || 'Unknown',
        breakdown: languageBreakdown,
      },
      fileStructure: fileTree.map((item: GitHubTreeItem) => ({
        path: item.path,
        type: item.type,
        size: item.size,
      })),
      commits: formattedCommits,
      contributors: {
        total: formattedContributors.length,
        list: formattedContributors,
      },
      readme,
      dependencies,
    };
  } catch (error: any) {
    console.error('Error fetching repository data:', error);
    throw new Error(error.message || 'Failed to fetch repository data');
  }
}

/**
 * Main function to fetch complete repository context (legacy support)
 */
export async function fetchRepoContext(repoUrl: string): Promise<RepoContext> {
  const repo = parseRepoUrl(repoUrl);
  
  if (!repo) {
    throw new Error('Invalid GitHub repository URL');
  }

  console.log(`Fetching repository: ${repo.owner}/${repo.name}`);

  const maxFiles = parseInt(process.env.MAX_FILES_PER_REPO || '50');

  // Fetch file tree
  const fileTree = await fetchFileTree(repo.owner, repo.name);
  console.log(`Found ${fileTree.length} relevant files`);

  // Fetch package.json
  const packageJson = await fetchPackageJson(repo.owner, repo.name);

  // Fetch content for files (up to MAX_FILES)
  const files: GitHubFile[] = [];
  const filesToFetch = fileTree.slice(0, maxFiles);

  for (const item of filesToFetch) {
    const content = await fetchFileContent(repo.owner, repo.name, item.path);
    if (content) {
      files.push({
        path: item.path,
        content,
        size: item.size || 0,
        type: item.path.split('.').pop() || 'unknown',
      });
    }
  }

  console.log(`Successfully fetched ${files.length} files`);

  return {
    repo,
    files,
    fileTree,
    packageJson,
    totalFiles: fileTree.length,
    analyzedFiles: files.length,
  };
}

/**
 * Build a context string from repository data (legacy support)
 */
export function buildContextString(repoContext: RepoContext): string {
  const { repo, files, fileTree, packageJson } = repoContext;
  
  let context = `# Repository: ${repo.name}\n`;
  context += `URL: ${repo.url}\n\n`;

  // Add package.json info if available
  if (packageJson) {
    context += `## Package Information\n`;
    context += `Name: ${packageJson.name || 'N/A'}\n`;
    context += `Version: ${packageJson.version || 'N/A'}\n`;
    context += `Description: ${packageJson.description || 'N/A'}\n`;
    
    if (packageJson.dependencies) {
      context += `\nDependencies:\n`;
      Object.keys(packageJson.dependencies).slice(0, 10).forEach(dep => {
        context += `- ${dep}: ${packageJson.dependencies[dep]}\n`;
      });
    }
    context += `\n`;
  }

  // Add file tree structure
  context += `## File Structure (${fileTree.length} files)\n`;
  fileTree.slice(0, 30).forEach(item => {
    context += `- ${item.path}\n`;
  });
  if (fileTree.length > 30) {
    context += `... and ${fileTree.length - 30} more files\n`;
  }
  context += `\n`;

  // Add file contents
  context += `## File Contents\n\n`;
  files.forEach(file => {
    context += `### File: ${file.path}\n`;
    context += `\`\`\`${file.type}\n`;
    context += file.content;
    context += `\n\`\`\`\n\n`;
  });

  return context;
}
