/**
 * API Route: Dead Code Detection
 * Analyzes repository for unused code, functions, variables, and files
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchCompleteRepoData } from '@/lib/github';
import { analyzeDeadCode } from '@/lib/gemini';

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

    // Fetch repository data
    const repoData = await fetchCompleteRepoData(repoUrl);
    console.log('[DeadCode] Repository data fetched, starting dead code analysis...');

    // Analyze for dead code using Gemini AI
    const deadCodeAnalysis = await analyzeDeadCode(repoData);
    console.log('[DeadCode] Dead code analysis complete');

    return res.status(200).json({
      success: true,
      data: deadCodeAnalysis,
    });
  } catch (error: any) {
    console.error('[DeadCode] Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze dead code',
    });
  }
}

// Made with Bob
