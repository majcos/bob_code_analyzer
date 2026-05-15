/**
 * Core type definitions for the Bob Code Analyzer
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

// Bob API Types
export interface BobAnalysisRequest {
  prompt: string;
  context: string;
  feature: AnalysisFeature;
  repoUrl: string;
}

export interface BobAnalysisResponse {
  result: string;
  filesAnalyzed: string[];
  promptUsed: string;
  timestamp: string;
  feature: AnalysisFeature;
}

export type AnalysisFeature = 'summary' | 'techdebt' | 'deadcode' | 'chat';

// Analysis Result Types
export interface AppSummary {
  description: string;
  mainPurpose: string;
  keyFeatures: string[];
  techStack: string[];
  architecture: string;
}

export interface TechDebtItem {
  file: string;
  lineCount: number;
  complexity: 'low' | 'medium' | 'high' | 'critical';
  issues: string[];
  priority: number;
}

export interface DeadCodeItem {
  file: string;
  functionName: string;
  lineNumber: number;
  reason: string;
}

export interface ChatResponse {
  answer: string;
  relevantFiles: string[];
  codeSnippets?: Array<{
    file: string;
    code: string;
    explanation: string;
  }>;
  warnings?: string[];
}

// UI State Types
export interface AnalysisState {
  loading: boolean;
  error: string | null;
  result: BobAnalysisResponse | null;
  repoUrl: string;
}

export interface DemoRepo {
  url: string;
  name: string;
  description: string;
  cached: boolean;
}

// Made with Bob
