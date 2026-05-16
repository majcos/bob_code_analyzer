/**
 * Core type definitions for the GitHub Repository Analyzer
 */

// GitHub API Types
export interface GitHubRepo {
  owner: string;
  name: string;
  url: string;
}

export interface GitHubFile {
  path: string;
  content: string;
  size: number;
  type: string;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface RepoContext {
  repo: GitHubRepo;
  files: GitHubFile[];
  fileTree: GitHubTreeItem[];
  packageJson?: any;
  totalFiles: number;
  analyzedFiles: number;
}

// AI Analysis Types
export interface AIAnalysis {
  codeQualitySummary: string;
  securityIssues: string[];
  suggestedImprovements: string[];
  techStackExplanation: string;
  overallHealthScore: number;
  strengths: string[];
  weaknesses: string[];
  bestPractices: string[];
  recommendations: string[];
}
