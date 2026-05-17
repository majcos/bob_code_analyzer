/**
 * API Route: Dead Code Detection
 * Analyzes repository for unused code, functions, variables, and files
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

    console.log('[DeadCode] Analyzing repository:', repoUrl);

    // Check cache first - if main analysis was cached, use that
    const cachedResult = getCachedAnalysis(repoUrl);
    if (cachedResult?.unifiedAnalysis?.deadCode) {
      console.log('[DeadCode] Using cached dead code analysis');
      console.log('[DeadCode] Cached dead code items:', cachedResult.unifiedAnalysis.deadCode.deadCodeItems?.length || 0);
      return res.status(200).json({
        success: true,
        data: cachedResult.unifiedAnalysis.deadCode,
        cached: true,
      });
    }

    // Fetch repository data
    const repoData = await fetchCompleteRepoData(repoUrl);
    console.log('[DeadCode] Repository data fetched, extracting dead code from unified analysis...');

    // Use unified analysis to get dead code data (no separate API call)
    const unifiedAnalysis = await analyzeRepositoryUnified(repoData);
    console.log('[DeadCode] Dead code analysis extracted from unified response');
    console.log('[DeadCode] Dead code items found:', unifiedAnalysis.deadCode?.deadCodeItems?.length || 0);
    console.log('[DeadCode] Dead code summary:', JSON.stringify(unifiedAnalysis.deadCode?.summary || {}));

    return res.status(200).json({
      success: true,
      data: unifiedAnalysis.deadCode,
      cached: false,
    });
  } catch (error: any) {
    console.error('[DeadCode] Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze dead code',
    });
  }
}

// Made with Bob
