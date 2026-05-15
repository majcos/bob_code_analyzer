/**
 * IBM Bob API Integration Service
 * Handles communication with Bob API for code analysis
 */

import axios from 'axios';
import type { BobAnalysisRequest, BobAnalysisResponse, AnalysisFeature } from '@/types';
import { getBobApiKey, getBobTeamId } from './load-credentials';

const BOB_API_URL = process.env.BOB_API_URL || '';
const BOB_API_KEY = getBobApiKey();
const BOB_TEAM_ID = getBobTeamId();

/**
 * Feature-specific prompts for Bob analysis
 */
const FEATURE_PROMPTS = {
  summary: `Analyze this repository and provide a comprehensive summary in plain English.

Your response should include:
1. **What this app does**: A clear, concise description of the application's main purpose
2. **Key features**: List the 3-5 most important features or capabilities
3. **Tech stack**: Identify the main technologies, frameworks, and libraries used
4. **Architecture**: Describe the overall architecture pattern (e.g., MVC, microservices, etc.)

Format your response in clear sections with bullet points where appropriate.`,

  techdebt: `Analyze this repository for technical debt and code quality issues.

Identify and rank files by:
1. **Complexity**: Files with high cyclomatic complexity or deeply nested logic
2. **Size**: Unusually large files that should be refactored
3. **Code smells**: Duplicated code, magic numbers, poor naming conventions
4. **Maintainability risks**: Files that are difficult to understand or modify

For each problematic file, provide:
- File path
- Line count
- Complexity level (low/medium/high/critical)
- Specific issues found
- Priority ranking (1-10)

Return results as a ranked list, highest priority first.`,

  deadcode: `Analyze this repository to identify dead code - functions, classes, or exports that are defined but never used.

For each piece of dead code found, provide:
1. **File path**: Where the unused code is located
2. **Function/class name**: The specific identifier
3. **Line number**: Where it's defined
4. **Reason**: Why it appears to be unused (e.g., "exported but never imported", "defined but never called")

Focus on:
- Exported functions/classes with no imports elsewhere
- Internal functions that are never called
- Unused utility functions
- Orphaned components

Be thorough but avoid false positives from dynamic imports or reflection.`,

  chat: `You are a code analysis assistant with deep knowledge of this repository.

Answer the user's question with:
1. **Direct answer**: Clear, concise response to their question
2. **Relevant files**: List specific files that relate to the question
3. **Code snippets**: Show relevant code sections with explanations
4. **Warnings**: Any caveats, edge cases, or potential issues to be aware of

Be specific and reference actual code from the repository. If you're unsure, say so rather than guessing.`,
};

/**
 * Get Bob API headers
 */
function getBobHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${BOB_API_KEY}`,
  };
  
  // Add team ID header if provided
  if (BOB_TEAM_ID) {
    headers['X-Team-Id'] = BOB_TEAM_ID;
  }
  
  return headers;
}

/**
 * Call Bob API for analysis
 */
export async function analyzewithBob(
  request: BobAnalysisRequest
): Promise<BobAnalysisResponse> {
  // Mock mode check - return mock data if using mock-key
  if (BOB_API_KEY === 'mock-key') {
    console.log('🔧 Running in mock mode - returning simulated analysis');
    
    const mockResponses: Record<AnalysisFeature, string> = {
      summary: `# Repository Summary (Mock Data)

**What this app does:**
This is a Next.js-based code analysis tool that integrates with Bob AI to provide intelligent code insights.

**Key features:**
- Repository analysis with AI-powered insights
- Technical debt detection
- Dead code identification
- Interactive chat interface for code questions
- GitHub integration for repository access

**Tech stack:**
- Next.js (React framework)
- TypeScript
- Tailwind CSS
- Axios for API calls
- Bob AI API integration

**Architecture:**
The application follows a typical Next.js architecture with:
- API routes for backend functionality
- React components for UI
- Service layer for external integrations (GitHub, Bob AI)
- Type-safe TypeScript throughout`,

      techdebt: `# Technical Debt Analysis (Mock Data)

## High Priority Issues

### 1. src/lib/bob.ts
- **Line count:** 260
- **Complexity:** High
- **Issues:**
  - Large file with multiple responsibilities
  - Could be split into separate modules
  - Error handling could be more robust
- **Priority:** 8/10

### 2. src/pages/api/analyze/summary.ts
- **Line count:** 150
- **Complexity:** Medium
- **Issues:**
  - Duplicated error handling logic
  - Could benefit from middleware pattern
- **Priority:** 6/10

### 3. src/components/AnalysisPanel.tsx
- **Line count:** 200
- **Complexity:** Medium
- **Issues:**
  - Component is doing too much
  - State management could be improved
  - Consider splitting into smaller components
- **Priority:** 5/10`,

      deadcode: `# Dead Code Analysis (Mock Data)

## Unused Code Found

### 1. src/lib/github.ts
- **Function:** \`parseRepositoryUrl\`
- **Line:** 45
- **Reason:** Exported but never imported in any other file
- **Recommendation:** Remove if truly unused, or document if kept for future use

### 2. src/types/index.ts
- **Type:** \`LegacyAnalysisType\`
- **Line:** 78
- **Reason:** Type definition exists but is never referenced
- **Recommendation:** Remove deprecated type definition

### 3. src/lib/bob.ts
- **Function:** \`formatBobResponse\`
- **Line:** 180
- **Reason:** Internal function defined but never called
- **Recommendation:** Remove or integrate into response handling`,

      chat: `# Chat Response (Mock Data)

Based on your question about the codebase, here's what I found:

**Direct Answer:**
The application uses a service-oriented architecture with clear separation between API routes, business logic, and UI components.

**Relevant Files:**
- \`src/lib/bob.ts\` - Bob AI integration service
- \`src/lib/github.ts\` - GitHub API integration
- \`src/pages/api/analyze/*\` - Analysis API endpoints

**Code Structure:**
The main analysis flow goes through:
1. API route receives request
2. GitHub service fetches repository data
3. Bob service processes the analysis
4. Results are returned to the frontend

**Warnings:**
- Make sure to configure API keys properly
- Rate limiting should be considered for production use
- Error handling could be more comprehensive`,
    };

    return {
      result: mockResponses[request.feature] || 'Mock analysis result',
      filesAnalyzed: extractFilesFromContext(request.context),
      promptUsed: request.prompt,
      timestamp: new Date().toISOString(),
      feature: request.feature,
    };
  }

  // Validate Bob API configuration
  if (!BOB_API_URL || !BOB_API_KEY || BOB_API_URL.includes('your-bob-api-endpoint')) {
    throw new Error('Bob API is not configured. Please set BOB_API_URL and BOB_API_KEY in your .env file.');
  }

  console.log('Bob API URL:', BOB_API_URL);
  console.log('Bob API Key (first 20 chars):', BOB_API_KEY ? BOB_API_KEY.substring(0, 20) + '...' : 'Not found');
  console.log('Bob Team ID:', BOB_TEAM_ID || 'Not provided');

  try {
    const payload = {
      message: `${request.prompt}\n\n${request.context}`,
      stream: false,
    };
    
    console.log('Sending request to Bob API...');
    console.log('Endpoint:', `${BOB_API_URL}/chat`);
    
    const response = await axios.post(
      `${BOB_API_URL}/chat`,
      payload,
      {
        headers: getBobHeaders(),
        timeout: 60000, // 60 second timeout
      }
    );

    console.log('Bob API response received:', response.status);
    console.log('Response data keys:', Object.keys(response.data));

    return {
      result: response.data.response || response.data.message || response.data.result || JSON.stringify(response.data),
      filesAnalyzed: extractFilesFromContext(request.context),
      promptUsed: request.prompt,
      timestamp: new Date().toISOString(),
      feature: request.feature,
    };
  } catch (error: any) {
    console.error('Bob API error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: `${BOB_API_URL}/chat`,
    });
    
    // If API is not responding, throw error
    if (error.request && !error.response) {
      throw new Error('Bob API is not responding. Please check your BOB_API_URL and network connection.');
    }
    
    if (error.response) {
      const errorMsg = error.response.data?.error || error.response.data?.message || JSON.stringify(error.response.data);
      throw new Error(`Bob API error (${error.response.status}): ${errorMsg}`);
    } else {
      throw new Error(`Error calling Bob API: ${error.message}`);
    }
  }
}

/**
 * Get the appropriate prompt for a feature
 */
export function getFeaturePrompt(
  feature: AnalysisFeature,
  userQuestion?: string
): string {
  const basePrompt = FEATURE_PROMPTS[feature];
  
  if (feature === 'chat' && userQuestion) {
    return `${basePrompt}\n\nUser Question: ${userQuestion}`;
  }
  
  return basePrompt;
}

/**
 * Extract file paths from context string
 */
function extractFilesFromContext(context: string): string[] {
  const files: string[] = [];
  const fileRegex = /### File: (.+)/g;
  let match;
  
  while ((match = fileRegex.exec(context)) !== null) {
    files.push(match[1]);
  }
  
  return files;
}

/**
 * Stream Bob API response (for real-time updates)
 */
export async function streamBobAnalysis(
  request: BobAnalysisRequest,
  onChunk: (chunk: string) => void
): Promise<BobAnalysisResponse> {
  // Mock mode check - simulate streaming response
  if (BOB_API_KEY === 'mock-key') {
    console.log('🔧 Running in mock streaming mode');
    
    const mockResponse = `# Streaming Analysis (Mock Data)

This is a simulated streaming response for the ${request.feature} feature.

The analysis would normally stream in real-time from Bob AI, but we're running in mock mode.

**Analysis Details:**
- Feature: ${request.feature}
- Files analyzed: ${extractFilesFromContext(request.context).length}
- Timestamp: ${new Date().toISOString()}

This mock response demonstrates the streaming capability without requiring an actual API connection.`;

    // Simulate streaming by sending chunks
    const words = mockResponse.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk = words[i] + ' ';
      onChunk(chunk);
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return {
      result: mockResponse,
      filesAnalyzed: extractFilesFromContext(request.context),
      promptUsed: request.prompt,
      timestamp: new Date().toISOString(),
      feature: request.feature,
    };
  }

  if (!BOB_API_URL || !BOB_API_KEY) {
    throw new Error('Bob API configuration is missing.');
  }

  try {
    const response = await axios.post(
      `${BOB_API_URL}/analyze/stream`,
      {
        prompt: request.prompt,
        context: request.context,
        feature: request.feature,
      },
      {
        headers: getBobHeaders(),
        responseType: 'stream',
        timeout: 120000, // 2 minute timeout for streaming
      }
    );

    let fullResult = '';

    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        fullResult += text;
        onChunk(text);
      });

      response.data.on('end', () => {
        resolve({
          result: fullResult,
          filesAnalyzed: extractFilesFromContext(request.context),
          promptUsed: request.prompt,
          timestamp: new Date().toISOString(),
          feature: request.feature,
        });
      });

      response.data.on('error', (error: Error) => {
        reject(error);
      });
    });
  } catch (error: any) {
    console.error('Bob streaming error:', error);
    throw new Error(`Error streaming from Bob API: ${error.message}`);
  }
}

/**
 * Validate Bob API connection
 */
export async function validateBobConnection(): Promise<boolean> {
  // Mock mode check - always return true for mock-key
  if (BOB_API_KEY === 'mock-key') {
    console.log('🔧 Mock mode: Bob connection validation bypassed (returning true)');
    return true;
  }

  if (!BOB_API_URL || !BOB_API_KEY) {
    return false;
  }

  try {
    const response = await axios.get(`${BOB_API_URL}/health`, {
      headers: getBobHeaders(),
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    console.error('Bob API connection validation failed:', error);
    return false;
  }
}

// Made with Bob
