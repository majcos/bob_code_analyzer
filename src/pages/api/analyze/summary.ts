/**
 * API Route: App Summary Analysis
 * Analyzes a GitHub repository and provides a plain-English summary
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

    console.log(`[Summary] Analyzing repository: ${repoUrl}`);

    // Step 1: Fetch repository context from GitHub
    const repoContext = await fetchRepoContext(repoUrl);
    console.log(`[Summary] Fetched ${repoContext.analyzedFiles} files`);

    // Step 2: Build context string for Bob
    const contextString = buildContextString(repoContext);

    // Step 3: Get feature-specific prompt
    const prompt = getFeaturePrompt('summary');

    // Step 4: Analyze with Bob
    const result = await analyzewithBob({
      prompt,
      context: contextString,
      feature: 'summary',
      repoUrl,
    });

    console.log(`[Summary] Analysis complete`);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[Summary] Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze repository',
    });
  }
}

// Made with Bob
