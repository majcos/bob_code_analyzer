/**
 * Utility functions for managing recent repository history
 * Stores up to 5 most recent analyzed repos in localStorage
 */

const STORAGE_KEY = 'gorang_recent_repos';
const MAX_RECENT = 5;

/**
 * Extract owner/repo format from GitHub URL
 * @param url - Full GitHub URL
 * @returns Formatted string like "owner/repo" or null if invalid
 */
export function extractRepoName(url: string): string | null {
  try {
    // Handle various GitHub URL formats
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/\?#]+)/i,
      /^([^\/]+)\/([^\/\?#]+)$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const owner = match[1];
        const repo = match[2].replace(/\.git$/, ''); // Remove .git suffix if present
        return `${owner}/${repo}`;
      }
    }
    return null;
  } catch (e) {
    console.error('Error extracting repo name:', e);
    return null;
  }
}

/**
 * Add a repository to recent history
 * @param repoUrl - GitHub repository URL
 */
export function addRecentRepo(repoUrl: string): void {
  try {
    const repoName = extractRepoName(repoUrl);
    if (!repoName) return;

    // Get existing repos
    const existing = getRecentRepos();

    // Remove if already exists (to move to top)
    const filtered = existing.filter(r => r !== repoName);

    // Add to beginning
    const updated = [repoName, ...filtered].slice(0, MAX_RECENT);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('recentReposUpdated'));
  } catch (e) {
    console.error('Error adding recent repo:', e);
  }
}

/**
 * Get list of recent repositories
 * @returns Array of repo names in "owner/repo" format
 */
export function getRecentRepos(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error getting recent repos:', e);
    return [];
  }
}

/**
 * Remove a repository from recent history
 * @param repoName - Repository name in "owner/repo" format
 */
export function removeRecentRepo(repoName: string): void {
  try {
    const existing = getRecentRepos();
    const filtered = existing.filter(r => r !== repoName);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('recentReposUpdated'));
  } catch (e) {
    console.error('Error removing recent repo:', e);
  }
}

/**
 * Clear all recent repositories
 */
export function clearRecentRepos(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('recentReposUpdated'));
  } catch (e) {
    console.error('Error clearing recent repos:', e);
  }
}

/**
 * Convert repo name back to full GitHub URL
 * @param repoName - Repository name in "owner/repo" format
 * @returns Full GitHub URL
 */
export function repoNameToUrl(repoName: string): string {
  return `https://github.com/${repoName}`;
}

// Made with Bob
