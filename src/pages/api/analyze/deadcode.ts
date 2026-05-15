/**
 * API Route: Dead Code Detection
 * Identifies unused functions, classes, and exports in a repository
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchRepoContext, buildContextString } from '@/lib/github';
import { analyzewithBob, getFeaturePrompt } from '@/lib/bob';
import type { BobAnalysisResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BobAnalysisResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }

    console.log(`[DeadCode] Analyzing repository: ${repoUrl}`);

    // Step 1: Fetch repository context from GitHub
    const repoContext = await fetchRepoContext(repoUrl);
    console.log(`[DeadCode] Fetched ${repoContext.analyzedFiles} files`);

    // Step 2: Build context string for Bob
    const contextString = buildContextString(repoContext);

    // Step 3: Get feature-specific prompt
    const prompt = getFeaturePrompt('deadcode');

    // Step 4: Analyze with Bob
    const result = await analyzewithBob({
      prompt,
      context: contextString,
      feature: 'deadcode',
      repoUrl,
    });

    console.log(`[DeadCode] Analysis complete`);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[DeadCode] Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze repository',
    });
  }
}

// Made with Bob
