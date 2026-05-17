/**
 * API Route: Code Issues Analysis
 * Extracts errors and non-optimal code from repository
 * Uses cached unified analysis to avoid redundant API calls
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchCompleteRepoData } from '@/lib/github';
import { analyzeRepositoryUnified } from '@/lib/gemini';
import { getCachedAnalysis } from '@/lib/cache';

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

    // Check cache first - if main analysis was cached, use that
    const cachedResult = getCachedAnalysis(repoUrl);
    if (cachedResult?.unifiedAnalysis?.codeIssues) {
      console.log('[CodeIssues] Using cached code issues analysis');
      return res.status(200).json({
        success: true,
        data: cachedResult.unifiedAnalysis.codeIssues,
        cached: true,
      });
    }

    // Fetch repository data
    const repoData = await fetchCompleteRepoData(repoUrl);
    console.log('[CodeIssues] Repository data fetched, extracting code issues from unified analysis...');

    // Use unified analysis to get code issues data (no separate API call)
    const unifiedAnalysis = await analyzeRepositoryUnified(repoData);
    console.log('[CodeIssues] Code issues analysis extracted from unified response');

    return res.status(200).json({
      success: true,
      data: unifiedAnalysis.codeIssues,
      cached: false,
    });
  } catch (error: any) {
    console.error('[CodeIssues] Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze code issues',
    });
  }
}

// Made with Bob
