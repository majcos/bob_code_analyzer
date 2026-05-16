/**
 * API Route: Code Issues Analysis
 * Extracts errors and non-optimal code from repository
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchCompleteRepoData } from '@/lib/github';
import { analyzeCodeIssues } from '@/lib/gemini';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }

    console.log('[CodeIssues] Analyzing repository:', repoUrl);

    // Fetch repository data
    const repoData = await fetchCompleteRepoData(repoUrl);
    console.log('[CodeIssues] Repository data fetched, starting code issues analysis...');

    // Analyze code issues using Gemini AI
    const issuesAnalysis = await analyzeCodeIssues(repoData);
    console.log('[CodeIssues] Code issues analysis complete');

    return res.status(200).json({
      success: true,
      data: issuesAnalysis,
    });
  } catch (error: any) {
    console.error('[CodeIssues] Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze code issues',
    });
  }
}

// Made with Bob
