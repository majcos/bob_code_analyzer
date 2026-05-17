/**
 * API Route: Tech Debt Map Analysis
 * Analyzes repository architecture and technical debt
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

    console.log('[TechDebt] Analyzing repository:', repoUrl);

    // Check cache first - if main analysis was cached, use that
    const cachedResult = getCachedAnalysis(repoUrl);
    if (cachedResult?.unifiedAnalysis?.techDebt) {
      console.log('[TechDebt] Using cached tech debt analysis');
      return res.status(200).json({
        success: true,
        data: cachedResult.unifiedAnalysis.techDebt,
        cached: true,
      });
    }

    // Fetch repository data
    const repoData = await fetchCompleteRepoData(repoUrl);
    console.log('[TechDebt] Repository data fetched, extracting tech debt from unified analysis...');

    // Use unified analysis to get tech debt data (no separate API call)
    const unifiedAnalysis = await analyzeRepositoryUnified(repoData);
    console.log('[TechDebt] Tech debt analysis extracted from unified response');

    return res.status(200).json({
      success: true,
      data: unifiedAnalysis.techDebt,
      cached: false,
    });
  } catch (error: any) {
    console.error('[TechDebt] Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze tech debt',
    });
  }
}

// Made with Bob
