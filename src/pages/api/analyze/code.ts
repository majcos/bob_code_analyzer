/**
 * API Route: Repository Analysis
 * Analyzes GitHub repositories using GitHub API and Gemini AI
 * Now with caching to reduce API calls and credit consumption
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchCompleteRepoData, parseRepoUrl } from '@/lib/github';
import { analyzeRepositoryUnified } from '@/lib/gemini';
import { getCachedAnalysis, setCachedAnalysis } from '@/lib/cache';

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

    // Validate GitHub URL
    const repo = parseRepoUrl(repoUrl);
    if (!repo) {
      return res.status(400).json({
        error: 'Invalid GitHub repository URL. Please provide a valid GitHub URL (e.g., https://github.com/owner/repo or owner/repo)'
      });
    }

    console.log(`[Analysis] Analyzing repository: ${repo.owner}/${repo.name}`);

    // Check cache first to avoid unnecessary API calls
    const cachedResult = getCachedAnalysis(repoUrl);
    if (cachedResult) {
      console.log(`[Analysis] Returning cached result for ${repo.owner}/${repo.name}`);
      return res.status(200).json({
        success: true,
        data: cachedResult,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Fetch complete repository data from GitHub API
    const repoData = await fetchCompleteRepoData(repoUrl);

    console.log(`[Analysis] GitHub data fetched, starting unified AI analysis...`);

    // Perform unified analysis (all features in one API call)
    const unifiedAnalysis = await analyzeRepositoryUnified(repoData);

    console.log(`[Analysis] Unified analysis complete for ${repo.owner}/${repo.name}`);
    console.log(`[Analysis] Dead code items found: ${unifiedAnalysis.deadCode?.deadCodeItems?.length || 0}`);
    console.log(`[Analysis] Health score: ${unifiedAnalysis.codeQuality?.overallHealthScore || 'N/A'}`);

    // Prepare response data
    const responseData = {
      ...repoData,
      aiAnalysis: unifiedAnalysis.codeQuality,
      unifiedAnalysis, // Include full unified analysis for other endpoints
    };

    // Cache the result for future requests
    setCachedAnalysis(repoUrl, responseData);

    return res.status(200).json({
      success: true,
      data: responseData,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Analysis] Error:', error);
    
    // Handle specific error cases
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Repository not found. Please check the URL and try again.',
      });
    }
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        error: 'GitHub API rate limit exceeded. Please try again later.',
      });
    }

    if (error.message.includes('GITHUB_TOKEN')) {
      return res.status(500).json({
        error: 'GitHub token is not configured. Please contact the administrator.',
      });
    }

    if (error.message.includes('GEMINI_API_KEY')) {
      return res.status(500).json({
        error: 'Gemini API key is not configured. Please contact the administrator.',
      });
    }

    return res.status(500).json({
      error: error.message || 'Failed to analyze repository',
    });
  }
}
