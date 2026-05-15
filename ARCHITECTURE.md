# 🏗️ Architecture Documentation

## System Overview

Bob Code Analyzer is a three-layer architecture that demonstrates IBM Bob API's capabilities for automated code analysis. The system fetches GitHub repositories, processes them into structured context, and leverages Bob's AI to provide actionable insights.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   App    │  │   Tech   │  │   Dead   │  │  Friday  │      │
│  │ Summary  │  │   Debt   │  │   Code   │  │   Chat   │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │              │             │             │
└───────┼─────────────┼──────────────┼─────────────┼─────────────┘
        │             │              │             │
        └─────────────┴──────────────┴─────────────┘
                      │
        ┌─────────────▼──────────────┐
        │   Next.js API Routes       │
        │  /api/analyze/[feature]    │
        └─────────────┬──────────────┘
                      │
        ┌─────────────▼──────────────┐
        │   GitHub Integration       │
        │   - Fetch file tree        │
        │   - Download files         │
        │   - Build context          │
        └─────────────┬──────────────┘
                      │
        ┌─────────────▼──────────────┐
        │   Bob API Integration      │
        │   - Feature prompts        │
        │   - Context injection      │
        │   - Analysis execution     │
        └─────────────┬──────────────┘
                      │
        ┌─────────────▼──────────────┐
        │   IBM Bob API              │
        │   (External Service)       │
        └────────────────────────────┘
```

## Layer 1: GitHub Ingestion

### Purpose
Fetch and prepare repository data for analysis.

### Components

#### `src/lib/github.ts`

**Key Functions:**

1. **`parseRepoUrl(url: string)`**
   - Extracts owner and repo name from various URL formats
   - Supports: `https://github.com/owner/repo`, `owner/repo`
   - Returns: `GitHubRepo` object or null

2. **`fetchFileTree(owner: string, repo: string)`**
   - Calls GitHub API: `/repos/{owner}/{repo}/git/trees/{branch}?recursive=1`
   - Filters for relevant files: `.js`, `.ts`, `.tsx`, `.jsx`, `.json`
   - Limits to `MAX_FILES_PER_REPO` (default: 50)
   - Tries `main` branch first, falls back to `master`

3. **`fetchFileContent(owner: string, repo: string, path: string)`**
   - Fetches raw file content via GitHub Contents API
   - Decodes base64-encoded content
   - Returns UTF-8 string

4. **`fetchPackageJson(owner: string, repo: string)`**
   - Special handler for `package.json`
   - Provides dependency context for analysis
   - Returns parsed JSON or null

5. **`fetchRepoContext(repoUrl: string)`**
   - Orchestrates the entire fetch process
   - Returns complete `RepoContext` object
   - Includes: files, file tree, package.json, metadata

6. **`buildContextString(repoContext: RepoContext)`**
   - Converts structured data into formatted string
   - Includes: repo info, dependencies, file tree, file contents
   - Optimized for Bob's consumption

### Data Flow

```
GitHub URL
    ↓
Parse URL → Extract owner/repo
    ↓
Fetch Tree → Get all file paths
    ↓
Filter Files → Keep relevant extensions
    ↓
Fetch Contents → Download each file
    ↓
Build Context → Format for Bob
    ↓
Return RepoContext
```

### Rate Limiting

- Uses GitHub Personal Access Token for authentication
- Respects GitHub API rate limits (5,000 requests/hour)
- No caching in POC (each analysis is fresh)

## Layer 2: Bob Analysis

### Purpose
Transform repository context into actionable insights using IBM Bob API.

### Components

#### `src/lib/bob.ts`

**Feature-Specific Prompts:**

1. **App Summary Prompt**
   ```
   Analyze this repository and provide a comprehensive summary:
   - What this app does
   - Key features
   - Tech stack
   - Architecture
   ```

2. **Tech Debt Prompt**
   ```
   Identify technical debt and code quality issues:
   - Complex files
   - Large files
   - Code smells
   - Maintainability risks
   ```

3. **Dead Code Prompt**
   ```
   Find unused code:
   - Exported but never imported
   - Defined but never called
   - Orphaned components
   ```

4. **Chat Prompt**
   ```
   Answer user's question with:
   - Direct answer
   - Relevant files
   - Code snippets
   - Warnings
   ```

**Key Functions:**

1. **`analyzewithBob(request: BobAnalysisRequest)`**
   - Main analysis function
   - POSTs to Bob API with prompt + context
   - Returns structured `BobAnalysisResponse`
   - Handles errors gracefully

2. **`getFeaturePrompt(feature: AnalysisFeature, userQuestion?: string)`**
   - Returns appropriate prompt for feature
   - Injects user question for chat feature
   - Ensures consistent prompt structure

3. **`streamBobAnalysis(request, onChunk)`**
   - Streaming version for real-time updates
   - Calls Bob's streaming endpoint
   - Invokes callback for each chunk
   - Returns complete response when done

4. **`validateBobConnection()`**
   - Health check for Bob API
   - Verifies credentials
   - Returns boolean status

### Bob API Contract

**Request Format:**
```json
{
  "prompt": "Feature-specific prompt...",
  "context": "Full repository context...",
  "feature": "summary|techdebt|deadcode|chat"
}
```

**Response Format:**
```json
{
  "result": "Bob's analysis in plain English...",
  "filesAnalyzed": ["file1.ts", "file2.ts"],
  "promptUsed": "The prompt sent to Bob...",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "feature": "summary"
}
```

## Layer 3: Next.js Frontend

### Purpose
Provide intuitive UI for repository analysis with full transparency.

### Components

#### API Routes (`src/pages/api/analyze/`)

Each feature has its own API route:

1. **`summary.ts`** - App summary analysis
2. **`techdebt.ts`** - Technical debt detection
3. **`deadcode.ts`** - Dead code identification
4. **`chat.ts`** - Interactive Q&A

**Standard Flow:**
```typescript
1. Validate request (POST method, required params)
2. Fetch repository context from GitHub
3. Build context string
4. Get feature-specific prompt
5. Call Bob API
6. Return structured response
```

#### UI Components

**`src/pages/index.tsx`** - Main Dashboard
- Four-tab interface
- Repository URL input
- Tab-specific content areas
- Real-time loading states
- Error handling

**`src/components/AnalysisPanel.tsx`** - Reusable Analysis Display
- Shows Bob's analysis result
- Expandable "Files Analyzed" section
- Expandable "Prompt Sent to Bob" section
- Loading and error states
- Metadata display

### State Management

Uses React hooks for local state:

```typescript
interface TabState {
  loading: boolean;
  error: string | null;
  result: BobAnalysisResponse | null;
}
```

Each tab maintains independent state:
- `summaryState`
- `techDebtState`
- `deadCodeState`
- `chatState`

### User Experience Flow

```
1. User enters GitHub URL
2. User selects analysis tab
3. User clicks "Analyze with Bob"
4. Loading state shows spinner
5. API fetches repo from GitHub
6. API sends context to Bob
7. Bob analyzes and responds
8. Results display with transparency
9. User can expand details
```

## Data Models

### Core Types (`src/types/index.ts`)

```typescript
// GitHub data structures
interface GitHubRepo {
  owner: string;
  name: string;
  url: string;
}

interface GitHubFile {
  path: string;
  content: string;
  size: number;
  type: string;
}

interface RepoContext {
  repo: GitHubRepo;
  files: GitHubFile[];
  fileTree: GitHubTreeItem[];
  packageJson?: any;
  totalFiles: number;
  analyzedFiles: number;
}

// Bob API structures
interface BobAnalysisRequest {
  prompt: string;
  context: string;
  feature: AnalysisFeature;
  repoUrl: string;
}

interface BobAnalysisResponse {
  result: string;
  filesAnalyzed: string[];
  promptUsed: string;
  timestamp: string;
  feature: AnalysisFeature;
}
```

## Security Considerations

### Environment Variables
- GitHub token stored in `.env` (never committed)
- Bob API credentials in `.env` (never committed)
- Next.js automatically excludes `.env` from client bundle

### API Security
- All sensitive operations in API routes (server-side)
- No direct client-to-Bob communication
- GitHub token never exposed to client
- CORS headers configured for API routes

### Input Validation
- Repository URL parsing with error handling
- Required parameter validation in API routes
- Error messages don't expose sensitive info

## Performance Optimizations

### Current POC Limitations
- No caching (each analysis is fresh)
- 50 file limit per repository
- Sequential file fetching
- No request debouncing

### Production Recommendations
1. **Caching Layer**
   - Cache GitHub file contents (1 hour TTL)
   - Cache Bob responses (30 min TTL)
   - Use Redis or similar

2. **Parallel Processing**
   - Fetch files in parallel (Promise.all)
   - Batch GitHub API requests

3. **Streaming**
   - Implement streaming UI updates
   - Show files as they're fetched
   - Stream Bob's response in real-time

4. **Rate Limiting**
   - Implement per-user rate limits
   - Queue analysis requests
   - Show estimated wait time

## Error Handling

### GitHub API Errors
- 404: Repository not found → Try alternate branch
- 403: Rate limit exceeded → Show clear message
- 401: Invalid token → Prompt for valid token

### Bob API Errors
- Connection timeout → Retry with exponential backoff
- Invalid response → Show error with context
- API unavailable → Health check and user notification

### User-Facing Errors
All errors display in red alert boxes with:
- Clear error message
- Suggested action
- No technical jargon

## Deployment

### Environment Setup
```bash
# Required environment variables
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
BOB_API_URL=https://bob-api.example.com
BOB_API_KEY=bob_xxxxxxxxxxxxx
MAX_FILES_PER_REPO=50
```

### Build Process
```bash
npm install          # Install dependencies
npm run build        # Build for production
npm start            # Start production server
```

### Recommended Platforms
- **Vercel** - Optimal for Next.js (zero config)
- **Netlify** - Good alternative with edge functions
- **AWS Amplify** - Enterprise option
- **Docker** - Self-hosted option

## Monitoring & Observability

### Recommended Metrics
- API response times
- Bob API success rate
- GitHub API rate limit usage
- Error rates by type
- User analysis patterns

### Logging
- Console logs for development
- Structured logging for production
- Error tracking (Sentry, etc.)
- Performance monitoring (New Relic, etc.)

## Future Enhancements

### Short Term
1. Add response caching
2. Implement streaming UI
3. Support multiple branches
4. Add more file types

### Long Term
1. User authentication
2. Analysis history
3. Comparison between commits
4. Team collaboration features
5. Custom analysis prompts
6. Export reports (PDF, Markdown)

## Testing Strategy

### Unit Tests
- GitHub URL parsing
- Context string building
- Prompt generation

### Integration Tests
- GitHub API mocking
- Bob API mocking
- End-to-end API routes

### E2E Tests
- Full user flows
- Error scenarios
- Edge cases

## Conclusion

This architecture demonstrates a clean separation of concerns:
- **Layer 1** handles data acquisition
- **Layer 2** performs AI analysis
- **Layer 3** presents results

The design is intentionally simple for POC purposes but provides a solid foundation for production enhancements.