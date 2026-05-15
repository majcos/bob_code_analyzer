# Bob Code Analyzer

AI-Powered GitHub Repository Analysis using IBM Bob API

A Next.js application that provides ChatGPT-style interface for automated code analysis. Analyze any GitHub repository or ask questions about code through a conversational interface.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Conversational Interface
- ChatGPT-style chat interface
- Single input field for all interactions
- Support for text, images, and video attachments
- Real-time streaming responses
- Message history with context awareness

### Repository Analysis
- Paste any GitHub repository URL for instant analysis
- Automatic detection of repository URLs
- Comprehensive code insights
- Technical debt identification
- Dead code detection

### Interactive Q&A
- Ask questions about code
- Get specific answers with file references
- Context-aware responses
- Follow-up question support

## Architecture

```
GitHub Repo URL
      ↓
[Next.js Frontend] → [Next.js API Routes] → [IBM Bob API]
      ↓                      ↓
  Chat Interface        GitHub REST API
                        (fetch raw files)
```

### Three-Layer Architecture

1. **GitHub Ingestion Layer**
   - Fetches repository file tree via GitHub REST API
   - Downloads raw file contents for `.js`, `.ts`, `.tsx`, `.jsx` files
   - Extracts `package.json` for dependency context
   - Optimized for performance (50 file limit)

2. **Bob Analysis Layer**
   - Context-aware prompts for analysis
   - Injects full repository context
   - Returns structured analysis results
   - Supports multiple analysis types

3. **Next.js Frontend Layer**
   - ChatGPT-style conversational interface
   - Real-time message updates
   - File attachment support (images, videos, documents)
   - Responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- GitHub Personal Access Token
- IBM Bob API credentials

### Installation

1. Clone the repository
   ```bash
   git clone <your-repo-url>
   cd bob-code-analyzer
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables

   Create a `.env` file in the root directory:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   BOB_API_URL=https://your-bob-api-endpoint.com
   BOB_API_KEY=your_bob_api_key
   MAX_FILES_PER_REPO=50
   ```

4. Add your logo (optional)

   Replace `public/logo.png` with your own logo image

5. Run the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Usage

### Analyzing a Repository

Simply paste a GitHub repository URL in the chat:
```
https://github.com/owner/repo
```
or
```
owner/repo
```

Bob will automatically analyze the repository and provide insights.

### Asking Questions

Ask any question about code:
```
What are common security vulnerabilities in Node.js apps?
```

If you've previously analyzed a repository, Bob will answer in that context.

### Attaching Files

Click the paperclip icon to attach:
- Images (PNG, JPG, GIF)
- Videos (MP4, WebM)
- Documents (PDF, TXT, DOC)

## Project Structure

```
bob-code-analyzer/
├── public/
│   └── logo.png              # Your custom logo (replace this)
├── src/
│   ├── lib/
│   │   ├── github.ts         # GitHub API integration
│   │   └── bob.ts            # IBM Bob API integration
│   ├── pages/
│   │   ├── api/
│   │   │   └── analyze/
│   │   │       ├── summary.ts    # App summary endpoint
│   │   │       ├── techdebt.ts   # Tech debt endpoint
│   │   │       ├── deadcode.ts   # Dead code endpoint
│   │   │       └── chat.ts       # Chat endpoint
│   │   ├── _app.tsx          # Next.js app wrapper
│   │   └── index.tsx         # Main chat interface
│   ├── styles/
│   │   └── globals.css       # Global styles
│   └── types/
│       └── index.ts          # TypeScript types
├── .env                      # Environment variables (create this)
├── .env.example              # Environment template
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies
```

## API Endpoints

### POST `/api/analyze/summary`
Analyzes repository and returns app summary.

### POST `/api/analyze/techdebt`
Identifies technical debt and code quality issues.

### POST `/api/analyze/deadcode`
Finds unused functions and exports.

### POST `/api/analyze/chat`
Interactive Q&A about code or repositories.

## Performance Optimizations

- Efficient file fetching with parallel requests
- Smart context building for Bob API
- Optimized rendering with React hooks
- Minimal re-renders with proper state management
- Lazy loading for attachments

## Customization

### Adding Your Logo

Replace `public/logo.png` with your logo:
- Recommended size: 32x32px or 64x64px
- Supported formats: PNG, SVG, JPG
- Transparent background recommended

### Styling

Edit `src/styles/globals.css` for global styles or modify Tailwind classes in components.

## Technology Stack

- **Frontend:** Next.js 14, React 18, TypeScript 5
- **Styling:** Tailwind CSS 3
- **Icons:** Lucide React
- **API Integration:** Axios
- **AI:** IBM Bob API
- **Data Source:** GitHub REST API

## Security

- All API keys stored in `.env` (never committed)
- Server-side API calls only
- No client-side exposure of credentials
- Input validation on all endpoints

## Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### "GitHub API rate limit exceeded"
Verify your `GITHUB_TOKEN` is set correctly in `.env`

### "Bob API is not responding"
Check `BOB_API_URL` and `BOB_API_KEY` in `.env`

### Logo not showing
Ensure `public/logo.png` exists and is a valid image file

## Contributing

This is a production-ready application. For enhancements:
- Add response caching
- Implement streaming responses
- Support multiple branches
- Add user authentication
- Expand file type support

## License

MIT License

## Acknowledgments

- IBM Bob API for AI-driven code analysis
- GitHub for comprehensive REST API
- Next.js team for excellent developer experience
- Vercel for deployment platform

---

Built to showcase IBM Bob's capabilities in a modern, conversational interface