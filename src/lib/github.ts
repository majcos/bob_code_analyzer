/**
 * GitHub API Integration Service
 * Handles fetching repository data from GitHub REST API
 */

import axios from 'axios';
import type { GitHubRepo, GitHubFile, GitHubTreeItem, RepoContext } from '@/types';

const GITHUB_API_BASE = 'https://api.github.com';
const MAX_FILES = parseInt(process.env.MAX_FILES_PER_REPO || '50', 10);

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
 * Get GitHub API headers with authentication
 */
function getHeaders() {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  
  return headers;
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
    
    // Filter for relevant files only (JS, TS, TSX, JSX)
    const relevantExtensions = ['.js', '.ts', '.tsx', '.jsx', '.json'];
    const tree = response.data.tree.filter((item: GitHubTreeItem) => {
      if (item.type !== 'blob') return false;
      return relevantExtensions.some(ext => item.path.endsWith(ext));
    });

    return tree.slice(0, MAX_FILES);
  } catch (error: any) {
    if (error.response?.status === 404) {
      // Try 'master' branch if 'main' doesn't exist
      try {
        const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/master?recursive=1`;
        const response = await axios.get(url, { headers: getHeaders() });
        
        const relevantExtensions = ['.js', '.ts', '.tsx', '.jsx', '.json'];
        const tree = response.data.tree.filter((item: GitHubTreeItem) => {
          if (item.type !== 'blob') return false;
          return relevantExtensions.some(ext => item.path.endsWith(ext));
        });

        return tree.slice(0, MAX_FILES);
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
    console.log('No package.json found or error parsing it');
    return null;
  }
}

/**
 * Main function to fetch complete repository context
 */
export async function fetchRepoContext(repoUrl: string): Promise<RepoContext> {
  const repo = parseRepoUrl(repoUrl);
  
  if (!repo) {
    throw new Error('Invalid GitHub repository URL');
  }

  console.log(`Fetching repository: ${repo.owner}/${repo.name}`);

  // Fetch file tree
  const fileTree = await fetchFileTree(repo.owner, repo.name);
  console.log(`Found ${fileTree.length} relevant files`);

  // Fetch package.json
  const packageJson = await fetchPackageJson(repo.owner, repo.name);

  // Fetch content for all files (up to MAX_FILES)
  const files: GitHubFile[] = [];
  const filesToFetch = fileTree.slice(0, MAX_FILES);

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
 * Build a context string for Bob API from repository data
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

// Made with Bob
