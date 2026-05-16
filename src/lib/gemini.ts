/**
 * Google Gemini AI Integration Service
 * Handles AI-powered code analysis using Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Get Gemini API key from environment
 */
function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return apiKey;
}

/**
 * Initialize Gemini AI client
 */
function getGeminiClient() {
  const apiKey = getGeminiApiKey();
  // Use v1 API instead of v1beta
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

/**
 * Analyze repository code using Gemini AI
 */
export async function analyzeCodeWithGemini(repoData: any): Promise<any> {
  try {
    const genAI = getGeminiClient();
    // Use gemini-2.5-flash which is available in the current API version
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });

    // Build analysis prompt
    const prompt = buildAnalysisPrompt(repoData);

    console.log('[Gemini] Sending analysis request...');
    
    // Generate analysis
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    console.log('[Gemini] Analysis complete');

    // Parse the analysis response
    const analysis = parseAnalysisResponse(analysisText);

    return analysis;
  } catch (error: any) {
    console.error('[Gemini] Error analyzing code:', error);
    throw new Error(`Gemini AI analysis failed: ${error.message}`);
  }
}

/**
 * Build comprehensive analysis prompt for Gemini
 */
function buildAnalysisPrompt(repoData: any): string {
  const { repo, languages, fileStructure, dependencies, readme } = repoData;

  let prompt = `You are an expert code analyst. Analyze this GitHub repository and provide a comprehensive assessment.

Repository: ${repo.name}
Description: ${repo.description}
Primary Language: ${languages.primary}
Total Files: ${fileStructure.length}

Language Breakdown:
${languages.breakdown.map((lang: any) => `- ${lang.language}: ${lang.percentage}%`).join('\n')}

`;

  // Add dependencies info
  if (dependencies) {
    prompt += `\nDependencies (${dependencies.type}):
${dependencies.list.slice(0, 20).map((dep: any) => `- ${dep.name}@${dep.version}`).join('\n')}
`;
  }

  // Add file structure sample
  prompt += `\nFile Structure (sample):
${fileStructure.slice(0, 30).map((file: any) => `- ${file.path}`).join('\n')}
`;

  // Add README excerpt
  if (readme) {
    const readmeExcerpt = readme.substring(0, 1000);
    prompt += `\nREADME excerpt:
${readmeExcerpt}
`;
  }

  prompt += `

Please provide a detailed analysis in the following JSON format:
{
  "codeQualitySummary": "Brief summary of overall code quality",
  "securityIssues": ["List of potential security concerns or 'None detected'"],
  "suggestedImprovements": ["List of actionable improvement suggestions"],
  "techStackExplanation": "Explanation of the technology stack and architecture",
  "overallHealthScore": 85,
  "strengths": ["List of project strengths"],
  "weaknesses": ["List of areas for improvement"],
  "bestPractices": ["List of best practices being followed"],
  "recommendations": ["List of specific recommendations"]
}

Provide ONLY the JSON response, no additional text.`;

  return prompt;
}

/**
 * Parse Gemini's analysis response
 */
function parseAnalysisResponse(responseText: string): any {
  try {
    // Remove markdown code blocks if present
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    const analysis = JSON.parse(cleanedText);

    // Validate required fields
    return {
      codeQualitySummary: analysis.codeQualitySummary || 'Analysis completed',
      securityIssues: Array.isArray(analysis.securityIssues) ? analysis.securityIssues : ['No specific issues detected'],
      suggestedImprovements: Array.isArray(analysis.suggestedImprovements) ? analysis.suggestedImprovements : [],
      techStackExplanation: analysis.techStackExplanation || 'Technology stack analysis unavailable',
      overallHealthScore: typeof analysis.overallHealthScore === 'number' ? analysis.overallHealthScore : 75,
      strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
      weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [],
      bestPractices: Array.isArray(analysis.bestPractices) ? analysis.bestPractices : [],
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
    };
  } catch (error) {
    console.error('[Gemini] Error parsing response:', error);
    // Return a fallback analysis
    return {
      codeQualitySummary: 'Unable to parse detailed analysis. The repository appears to be well-structured.',
      securityIssues: ['Analysis parsing error - manual review recommended'],
      suggestedImprovements: ['Review code structure and dependencies'],
      techStackExplanation: 'Technology stack analysis unavailable due to parsing error',
      overallHealthScore: 70,
      strengths: ['Repository is accessible and contains code'],
      weaknesses: ['Detailed analysis unavailable'],
      bestPractices: [],
      recommendations: ['Perform manual code review'],
    };
  }
}

/**
 * Analyze repository for dead code
 */
export async function analyzeDeadCode(repoData: any): Promise<any> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3, // Lower temperature for more precise detection
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });

    const prompt = buildDeadCodePrompt(repoData);
    console.log('[Gemini] Analyzing dead code...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    return parseDeadCodeResponse(analysisText);
  } catch (error: any) {
    console.error('[Gemini] Error analyzing dead code:', error);
    throw new Error(`Dead code analysis failed: ${error.message}`);
  }
}

/**
 * Build dead code analysis prompt
 */
function buildDeadCodePrompt(repoData: any): string {
  const { repo, languages, fileStructure } = repoData;

  return `You are an expert code analyzer specializing in dead code detection. Analyze this repository for unused code.

Repository: ${repo.name}
Primary Language: ${languages.primary}
Total Files: ${fileStructure.length}

File Structure:
${fileStructure.slice(0, 50).map((file: any) => `- ${file.path}`).join('\n')}

Detect and report:
1. Functions defined but never called
2. Variables declared but never used
3. Imports that are never referenced
4. Files that are never imported or referenced
5. Commented out code blocks
6. Duplicate code blocks

Provide response in JSON format:
{
  "deadCodeItems": [
    {
      "type": "unused_function|unused_variable|unused_import|unused_file|commented_code|duplicate_code",
      "file": "path/to/file.ext",
      "line": 42,
      "endLine": 45,
      "code": "actual code snippet",
      "reason": "why this is considered dead code",
      "suggestion": "what to do about it"
    }
  ],
  "summary": {
    "totalIssues": 10,
    "byType": {
      "unused_function": 3,
      "unused_variable": 2,
      "unused_import": 2,
      "unused_file": 1,
      "commented_code": 1,
      "duplicate_code": 1
    }
  }
}

Provide ONLY the JSON response.`;
}

/**
 * Parse dead code analysis response
 */
function parseDeadCodeResponse(responseText: string): any {
  try {
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    const analysis = JSON.parse(cleanedText);
    return {
      deadCodeItems: Array.isArray(analysis.deadCodeItems) ? analysis.deadCodeItems : [],
      summary: analysis.summary || { totalIssues: 0, byType: {} }
    };
  } catch (error) {
    console.error('[Gemini] Error parsing dead code response:', error);
    return {
      deadCodeItems: [],
      summary: { totalIssues: 0, byType: {} }
    };
  }
}

/**
 * Analyze repository architecture for tech debt map
 */
export async function analyzeTechDebt(repoData: any): Promise<any> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.5,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });

    const prompt = buildTechDebtPrompt(repoData);
    console.log('[Gemini] Analyzing tech debt and architecture...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    return parseTechDebtResponse(analysisText);
  } catch (error: any) {
    console.error('[Gemini] Error analyzing tech debt:', error);
    throw new Error(`Tech debt analysis failed: ${error.message}`);
  }
}

/**
 * Build tech debt analysis prompt
 */
function buildTechDebtPrompt(repoData: any): string {
  const { repo, languages, fileStructure, dependencies } = repoData;

  return `You are an expert software architect. Analyze this repository's architecture and technical debt.

Repository: ${repo.name}
Primary Language: ${languages.primary}
Total Files: ${fileStructure.length}

Language Breakdown:
${languages.breakdown.map((lang: any) => `- ${lang.language}: ${lang.percentage}%`).join('\n')}

${dependencies ? `Dependencies: ${dependencies.list.length} packages` : ''}

File Structure:
${fileStructure.slice(0, 50).map((file: any) => `- ${file.path}`).join('\n')}

Analyze and provide:
1. Database architecture (if detected) - tables, relationships, keys
2. Code architecture - module dependencies, entry points, API routes
3. Legacy system patterns (COBOL, RPG, old frameworks)
4. Low-code/no-code patterns
5. Technical debt areas

IMPORTANT: For the Mermaid diagram, follow these strict syntax rules:
- Use ONLY alphanumeric characters, spaces, hyphens, and underscores in node labels
- DO NOT use parentheses, brackets, or special characters in node labels
- Use simple, clear node names
- Valid example: A[User Service] --> B[Database Layer]
- Invalid example: A[User Service (Auth)] --> B[Database (SQL)]

Provide response in JSON format:
{
  "hasDatabase": true|false,
  "databaseArchitecture": {
    "type": "SQL|NoSQL|Unknown",
    "tables": [
      {
        "name": "users",
        "relationships": ["has many posts", "belongs to organization"],
        "keys": ["id PK", "org_id FK"]
      }
    ]
  },
  "codeArchitecture": {
    "entryPoints": ["src/index.ts", "src/app.ts"],
    "modules": [
      {
        "name": "auth",
        "path": "src/auth",
        "dependencies": ["database", "utils"],
        "dependents": ["api", "middleware"]
      }
    ],
    "apiRoutes": ["/api/users", "/api/posts"]
  },
  "legacyPatterns": {
    "detected": true|false,
    "language": "COBOL|RPG|Legacy PHP|None",
    "issues": ["description of legacy issues"],
    "modernizationPath": "suggested migration approach"
  },
  "lowCodeDetection": {
    "detected": true|false,
    "tools": ["tool names"],
    "opportunities": ["where low-code could help"]
  },
  "techDebtAreas": [
    {
      "area": "Authentication",
      "severity": "high|medium|low",
      "description": "what the issue is",
      "impact": "how it affects the system",
      "recommendation": "how to fix it"
    }
  ],
  "diagramData": {
    "mermaidCode": "graph TD\n  A[Entry Point] --> B[Module Layer]\n  B --> C[Database Layer]"
  }
}

Provide ONLY the JSON response.`;
}

/**
 * Sanitize Mermaid diagram code to ensure valid syntax
 */
function sanitizeMermaidCode(mermaidCode: string): string {
  if (!mermaidCode) {
    return 'graph TD\n  A[No diagram available]';
  }

  // Replace problematic characters in node labels
  // Match pattern: [text with parentheses] and remove the parentheses content
  let sanitized = mermaidCode.replace(/\[([^\]]*)\([^\)]*\)([^\]]*)\]/g, '[$1$2]');
  
  // Remove any remaining special characters that might cause issues
  // Keep only: letters, numbers, spaces, hyphens, underscores, newlines, arrows, and basic Mermaid syntax
  sanitized = sanitized.split('\n').map(line => {
    // If line contains node definition with brackets, sanitize the label
    if (line.includes('[') && line.includes(']')) {
      return line.replace(/\[([^\]]+)\]/g, (match, label) => {
        // Remove parentheses and their content from labels
        const cleanLabel = label.replace(/\([^\)]*\)/g, '').trim();
        return `[${cleanLabel}]`;
      });
    }
    return line;
  }).join('\n');

  return sanitized;
}

/**
 * Parse tech debt analysis response
 */
function parseTechDebtResponse(responseText: string): any {
  try {
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    const analysis = JSON.parse(cleanedText);
    
    // Sanitize the Mermaid code if present
    let mermaidCode = 'graph TD\n  A[No diagram available]';
    if (analysis.diagramData && analysis.diagramData.mermaidCode) {
      mermaidCode = sanitizeMermaidCode(analysis.diagramData.mermaidCode);
    }
    
    return {
      hasDatabase: analysis.hasDatabase || false,
      databaseArchitecture: analysis.databaseArchitecture || null,
      codeArchitecture: analysis.codeArchitecture || { entryPoints: [], modules: [], apiRoutes: [] },
      legacyPatterns: analysis.legacyPatterns || { detected: false, language: 'None', issues: [], modernizationPath: '' },
      lowCodeDetection: analysis.lowCodeDetection || { detected: false, tools: [], opportunities: [] },
      techDebtAreas: Array.isArray(analysis.techDebtAreas) ? analysis.techDebtAreas : [],
      diagramData: { mermaidCode }
    };
  } catch (error) {
    console.error('[Gemini] Error parsing tech debt response:', error);
    return {
      hasDatabase: false,
      databaseArchitecture: null,
      codeArchitecture: { entryPoints: [], modules: [], apiRoutes: [] },
      legacyPatterns: { detected: false, language: 'None', issues: [], modernizationPath: '' },
      lowCodeDetection: { detected: false, tools: [], opportunities: [] },
      techDebtAreas: [],
      diagramData: { mermaidCode: 'graph TD\n  A[Analysis unavailable]' }
    };
  }
}

/**
 * Extract code issues (errors and non-optimal code)
 */
export async function analyzeCodeIssues(repoData: any): Promise<any> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });

    const prompt = buildCodeIssuesPrompt(repoData);
    console.log('[Gemini] Analyzing code issues...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    return parseCodeIssuesResponse(analysisText);
  } catch (error: any) {
    console.error('[Gemini] Error analyzing code issues:', error);
    throw new Error(`Code issues analysis failed: ${error.message}`);
  }
}

/**
 * Build code issues analysis prompt
 */
function buildCodeIssuesPrompt(repoData: any): string {
  const { repo, languages, fileStructure } = repoData;

  return `You are an expert code reviewer. Extract ONLY problematic code from this repository.

Repository: ${repo.name}
Primary Language: ${languages.primary}

File Structure:
${fileStructure.slice(0, 50).map((file: any) => `- ${file.path}`).join('\n')}

Identify and extract:

ERROR CODE:
- Syntax errors
- Runtime error patterns
- Null pointer risks
- Uncaught exceptions
- Missing error handling

NON-OPTIMAL CODE:
- Slow/inefficient algorithms
- N+1 query problems
- Hardcoded values (should be constants)
- Long functions (>50 lines)
- Deeply nested code (>3 levels)
- Missing input validation
- Repeated code (should be functions)

Provide response in JSON format:
{
  "issues": [
    {
      "severity": "critical|high|medium|low",
      "category": "error|performance|maintainability|security",
      "file": "path/to/file.ext",
      "line": 42,
      "endLine": 50,
      "code": "problematic code snippet",
      "problem": "what the issue is",
      "fixedCode": "corrected version of the code",
      "explanation": "why this is better"
    }
  ],
  "summary": {
    "totalIssues": 15,
    "bySeverity": {
      "critical": 2,
      "high": 5,
      "medium": 6,
      "low": 2
    },
    "byCategory": {
      "error": 3,
      "performance": 4,
      "maintainability": 5,
      "security": 3
    },
    "estimatedFixTime": "4-6 hours"
  }
}

Provide ONLY the JSON response.`;
}

/**
 * Parse code issues analysis response
 */
function parseCodeIssuesResponse(responseText: string): any {
  try {
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    const analysis = JSON.parse(cleanedText);
    return {
      issues: Array.isArray(analysis.issues) ? analysis.issues : [],
      summary: analysis.summary || {
        totalIssues: 0,
        bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
        byCategory: { error: 0, performance: 0, maintainability: 0, security: 0 },
        estimatedFixTime: 'Unknown'
      }
    };
  } catch (error) {
    console.error('[Gemini] Error parsing code issues response:', error);
    return {
      issues: [],
      summary: {
        totalIssues: 0,
        bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
        byCategory: { error: 0, performance: 0, maintainability: 0, security: 0 },
        estimatedFixTime: 'Unknown'
      }
    };
  }
}
