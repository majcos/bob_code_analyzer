/**
 * API Route: Friday Chat
 * Interactive Q&A about the repository with Bob
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
    const { repoUrl, question } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log(`[Chat] Question about ${repoUrl}: ${question}`);

    // Step 1: Fetch repository context from GitHub
    const repoContext = await fetchRepoContext(repoUrl);
    console.log(`[Chat] Fetched ${repoContext.analyzedFiles} files`);

    // Step 2: Build context string for Bob
    const contextString = buildContextString(repoContext);

    // Step 3: Get feature-specific prompt with user question
    const prompt = getFeaturePrompt('chat', question);

    // Step 4: Analyze with Bob
    const result = await analyzewithBob({
      prompt,
      context: contextString,
      feature: 'chat',
      repoUrl,
    });

    console.log(`[Chat] Response generated`);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[Chat] Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process question',
    });
  }
}

// Made with Bob
