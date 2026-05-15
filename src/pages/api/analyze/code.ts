/**
 * API Route: Direct Code Analysis
 * Analyzes code snippets directly without requiring a GitHub repository
 */

import type { NextApiRequest, NextApiResponse } from 'next';
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
    const { code, question } = req.body;

    if (!code && !question) {
      return res.status(400).json({ error: 'Code or question is required' });
    }

    console.log(`[Code Analysis] Analyzing code snippet or question`);

    // Build context from the provided code
    const context = code
      ? `# Code Snippet for Analysis\n\n\`\`\`\n${code}\n\`\`\`\n\n`
      : '';

    // Create appropriate prompt
    let prompt: string;
    if (question && code) {
      // Question about specific code
      prompt = `Analyze the following code and answer this question: ${question}\n\nProvide specific insights based on the code provided.`;
    } else if (code) {
      // Just code analysis
      prompt = `Analyze this code snippet and provide insights on:
1. What the code does
2. Code quality and best practices
3. Potential issues or improvements
4. Security considerations
5. Performance optimization opportunities

Be specific and actionable in your analysis.`;
    } else {
      // Just a question
      prompt = `Answer this question about code or software development: ${question}

Provide a clear, detailed answer with examples where appropriate.`;
    }

    // Analyze with Bob
    const result = await analyzewithBob({
      prompt,
      context: context || 'General software development question',
      feature: 'chat',
      repoUrl: 'direct-code-input',
    });

    console.log(`[Code Analysis] Analysis complete`);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[Code Analysis] Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze code',
    });
  }
}

// Made with Bob
