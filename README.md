## Legacy System Code Analyzer

AI-Powered GitHub Repository Analysis using Google Gemini API

A Next.js application that provides an intuitive interface for automated code analysis. Analyze any GitHub repository to identify code issues, technical debt, dead code, and visualize architecture with Mermaid diagrams.

🌐 **Live Demo:** [https://bob-code-analyzer.vercel.app/](https://bob-code-analyzer.vercel.app/)

![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Deployed on](https://img.shields.io/badge/Deployed%20on-Vercel-black)

## 🤖 Built Entirely with IBM Bob AI

**This entire application was developed, debugged, and deployed using IBM Bob AI.**

- 💻 **Code Generation**: All source code written by Bob AI
- 🏗️ **Architecture Design**: System architecture and component structure designed by Bob AI
- 🐛 **Debugging & Fixes**: All bugs identified and resolved by Bob AI
- 🚀 **Deployment**: Complete deployment process handled by Bob AI
- 📝 **Documentation**: All documentation created by Bob AI

**Analysis Engine**: Google Gemini API is used solely for the code analysis features (identifying issues, technical debt, dead code). The application itself was built entirely by IBM Bob AI.

## ⚠️ Important Notes

- **API Rate Limits**: This application uses Google Gemini's free tier, which has daily request limits
- **Credits Reset**: AI analysis credits restore daily at midnight UTC
- **Usage Recommendation**: Use the live demo for testing; deploy your own instance for production use

## Features

### Repository Analysis
- Analyze any GitHub repository by URL
- Automatic detection of repository URLs
- Comprehensive code quality insights
- Technical debt identification
- Dead code detection
- Architecture visualization with Mermaid diagrams

### Multiple Analysis Views
- **Code Issues**: Identify bugs, security vulnerabilities, and code smells
- **Technical Debt**: Track maintainability issues and refactoring opportunities
- **Dead Code**: Find unused functions, variables, and imports
- **Architecture**: Visualize system architecture with interactive Mermaid diagrams

### Smart Analysis
- AI-powered insights using Google Gemini
- Context-aware recommendations
- File-level issue tracking
- Severity-based prioritization

## Architecture

```
GitHub Repo URL
      ↓
[Next.js Frontend] → [Next.js API Routes] → [Google Gemini API]
      ↓                      ↓
  Analysis Views        GitHub REST API
                        (fetch raw files)
```

### Three-Layer Architecture

1. **GitHub Ingestion Layer**
   - Fetches repository file tree via GitHub REST API
   - Downloads raw file contents for `.js`, `.ts`, `.tsx`, `.jsx`, `.py`, `.java`, etc.
   - Extracts `package.json` for dependency context
   - Optimized for performance (50 file limit)

2. **Gemini Analysis Layer**
   - AI-powered code analysis using Google Gemini 2.0 Flash
   - Context-aware prompts for different analysis types
   - Structured JSON responses
   - Supports multiple analysis modes

3. **Next.js Frontend Layer**
   - Modern tabbed interface for different analysis views
   - Real-time analysis results
   - Interactive Mermaid diagram rendering
   - Responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- GitHub Personal Access Token ([Create one here](https://github.com/settings/tokens))
- Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

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
   GEMINI_API_KEY=your_gemini_api_key
   MAX_FILES_PER_REPO=50
   CACHE_DURATION_MS=3600000
   ```

   **How to get your API keys:**
   - **GitHub Token**: Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens) and create a token with `repo` scope
   - **Gemini API Key**: Visit [Google AI Studio](https://aistudio.google.com/app/apikey) and create a new API key

4. Add your logo (optional)

   Replace `public/logo.png` with your own logo image

5. Run the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Usage

### Analyzing a Repository

1. Enter a GitHub repository URL in the input field:
   ```
   https://github.com/owner/repo
   ```
   or use the shorthand format:
   ```
   owner/repo
   ```

2. Click "Analyze Repository" or press Enter

3. View results in different tabs:
   - **Code Issues**: See bugs, security issues, and code smells
   - **Technical Debt**: Review maintainability concerns
   - **Dead Code**: Find unused code
   - **Architecture**: Visualize system structure

### Understanding Results

- **Severity Levels**: Critical, High, Medium, Low
- **File References**: Click to see exact locations
- **Recommendations**: AI-powered suggestions for fixes
- **Mermaid Diagrams**: Interactive architecture visualizations

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
│   │   │       ├── code.ts       # Code issues analysis
│   │   │       ├── techdebt.ts   # Tech debt analysis
│   │   │       ├── deadcode.ts   # Dead code detection
│   │   │       └── issues.ts     # General issues endpoint
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

### POST `/api/analyze/code`
Analyzes code quality and identifies issues.

**Request Body:**
```json
{
  "repoUrl": "owner/repo"
}
```

### POST `/api/analyze/techdebt`
Identifies technical debt and maintainability issues.

### POST `/api/analyze/deadcode`
Finds unused functions, variables, and imports.

### POST `/api/analyze/issues`
General issue detection and analysis.

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

- **Frontend:** Next.js 16, React 18, TypeScript 5
- **Styling:** Tailwind CSS 3
- **Icons:** Lucide React
- **API Integration:** Axios
- **AI:** Google Gemini 2.0 Flash
- **Diagrams:** Mermaid.js
- **Data Source:** GitHub REST API

## Security

- All API keys stored in `.env` (never committed)
- Server-side API calls only
- No client-side exposure of credentials
- Input validation on all endpoints

## Deployment to Vercel

This application is deployed on Vercel for optimal Next.js performance.

### Quick Deploy to Your Own Instance

1. **Fork or clone this repository**
2. **Go to [Vercel](https://vercel.com)** and sign in with GitHub
3. **Click "Add New Project"** and select your repository
4. **Add environment variables:**
   - `GITHUB_TOKEN` - Your GitHub Personal Access Token
   - `GEMINI_API_KEY` - Your Google Gemini API Key
   - `MAX_FILES_PER_REPO` - `50`
   - `CACHE_DURATION_MS` - `3600000`
5. **Click "Deploy"**

Your site will be live at `https://your-project.vercel.app` in 1-2 minutes!

### Getting API Keys

- **GitHub Token**: [Create here](https://github.com/settings/tokens) with `repo` scope
- **Gemini API Key**: [Get here](https://aistudio.google.com/app/apikey) (free tier available)

### API Rate Limits

- **Gemini Free Tier**: Limited requests per day (resets daily at midnight UTC)
- **GitHub API**: 5,000 requests/hour with authentication
- For production use, consider upgrading to paid tiers for higher limits

## Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### "GitHub API rate limit exceeded"
Verify your `GITHUB_TOKEN` is set correctly in `.env` and has the `repo` scope

### "Gemini API errors"
- Check your `GEMINI_API_KEY` is valid
- Verify you haven't exceeded the free tier limits
- **Note**: Free tier credits reset daily at midnight UTC
- Consider upgrading to a paid plan for higher limits

### Build fails on Vercel
- Ensure all environment variables are set in Vercel Dashboard
- Check build logs for specific errors
- Verify Node.js version is 20.9.0 or higher (configured in [`.nvmrc`](.nvmrc:1))

## Future Enhancements

Potential improvements for this application:
- Add response caching for faster repeated analyses
- Implement real-time streaming for large repositories
- Support analyzing specific branches
- Add user authentication and saved analyses
- Expand file type support beyond JavaScript/TypeScript
- Add custom rule configuration
- Export reports as PDF or Markdown

## License

MIT License

## Acknowledgments

- Google Gemini for powerful AI-driven code analysis
- GitHub for comprehensive REST API
- Next.js team for excellent developer experience
- Netlify for seamless deployment platform
- Mermaid.js for beautiful diagram rendering

---

Built to showcase AI-powered code analysis in a modern, intuitive interface
