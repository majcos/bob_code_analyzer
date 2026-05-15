# 🚀 Setup Guide

Complete setup instructions for Bob Code Analyzer.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and npm installed ([Download](https://nodejs.org/))
- **Git** installed ([Download](https://git-scm.com/))
- **GitHub Account** with a Personal Access Token
- **IBM Bob API** credentials (contact your administrator)

## Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd bob-code-analyzer
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- Next.js 14.2
- React 18.3
- TypeScript 5.4
- Tailwind CSS 3.4
- Axios 1.7
- Lucide React icons

## Step 3: Configure Environment Variables

### Create Environment File

```bash
cp .env.example .env
```

### Get GitHub Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name: "Bob Code Analyzer"
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `public_repo` (Access public repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

### Get IBM Bob API Credentials

Contact your IBM Bob administrator to obtain:
- Bob API URL
- Bob API Key

### Update .env File

Open `.env` and add your credentials:

```env
# GitHub API Configuration
GITHUB_TOKEN=ghp_your_actual_token_here

# IBM Bob API Configuration
BOB_API_URL=https://your-bob-api-endpoint.com
BOB_API_KEY=your_bob_api_key_here

# Optional: Configuration
MAX_FILES_PER_REPO=50
CACHE_DURATION_MS=3600000
```

**⚠️ Important:** Never commit the `.env` file to version control!

## Step 4: Verify Setup

### Check Node Version

```bash
node --version
# Should be v18.0.0 or higher
```

### Check Dependencies

```bash
npm list --depth=0
# Should show all packages without errors
```

### Test TypeScript Compilation

```bash
npm run type-check
# Should complete without errors
```

## Step 5: Run Development Server

```bash
npm run dev
```

You should see:

```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
event - compiled client and server successfully
```

## Step 6: Test the Application

1. **Open your browser** to [http://localhost:3000](http://localhost:3000)

2. **Enter a test repository URL:**
   - Try: `https://github.com/vercel/next.js`
   - Or: `vercel/next.js`

3. **Click "Analyze with Bob"** on the App Summary tab

4. **Verify the results:**
   - ✅ Loading spinner appears
   - ✅ Analysis completes without errors
   - ✅ Results display with Bob's analysis
   - ✅ "Files Analyzed" section shows files
   - ✅ "Prompt Sent to Bob" section shows prompt

## Troubleshooting

### Issue: "Cannot find module 'next'"

**Solution:** Dependencies not installed
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "GitHub API rate limit exceeded"

**Solution:** Add or verify your GitHub token
```bash
# Check if token is set
echo $GITHUB_TOKEN

# If empty, add to .env file
GITHUB_TOKEN=ghp_your_token_here
```

### Issue: "Bob API is not responding"

**Solution:** Verify Bob API credentials
1. Check `BOB_API_URL` is correct
2. Check `BOB_API_KEY` is valid
3. Test connection: `curl -H "Authorization: Bearer $BOB_API_KEY" $BOB_API_URL/health`

### Issue: TypeScript errors in IDE

**Solution:** Restart TypeScript server
- VS Code: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"
- Or run: `npm run type-check`

### Issue: Port 3000 already in use

**Solution:** Use a different port
```bash
PORT=3001 npm run dev
```

### Issue: Styles not loading

**Solution:** Rebuild Tailwind
```bash
rm -rf .next
npm run dev
```

## Development Workflow

### File Structure

```
bob-code-analyzer/
├── src/
│   ├── components/     # React components
│   ├── lib/           # Utility functions
│   ├── pages/         # Next.js pages & API routes
│   ├── styles/        # CSS files
│   └── types/         # TypeScript types
├── public/            # Static assets
├── .env               # Environment variables (not committed)
└── .env.example       # Template for .env
```

### Making Changes

1. **Edit files** in `src/` directory
2. **Save** - Next.js will auto-reload
3. **Check browser** for changes
4. **Check console** for errors

### Adding New Features

1. **Create types** in `src/types/index.ts`
2. **Add API route** in `src/pages/api/`
3. **Update UI** in `src/pages/index.tsx`
4. **Test thoroughly**

## Building for Production

### Build the Application

```bash
npm run build
```

This creates an optimized production build in `.next/` directory.

### Test Production Build Locally

```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to test.

### Production Checklist

- [ ] All environment variables set
- [ ] Build completes without errors
- [ ] All features work in production mode
- [ ] Error handling tested
- [ ] Performance acceptable
- [ ] Security review completed

## Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   - Go to Vercel Dashboard
   - Select your project
   - Settings → Environment Variables
   - Add: `GITHUB_TOKEN`, `BOB_API_URL`, `BOB_API_KEY`

5. **Redeploy**
   ```bash
   vercel --prod
   ```

### Deploy to Other Platforms

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Netlify deployment
- AWS Amplify deployment
- Docker deployment
- Self-hosted deployment

## Next Steps

1. **Read the documentation:**
   - [README.md](./README.md) - Project overview
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
   - [API.md](./API.md) - API documentation

2. **Explore the code:**
   - Start with `src/pages/index.tsx` (main UI)
   - Then `src/lib/github.ts` (GitHub integration)
   - Then `src/lib/bob.ts` (Bob integration)

3. **Try different repositories:**
   - Small repos (< 20 files) for quick tests
   - Medium repos (20-50 files) for full features
   - Different tech stacks (React, Vue, Node.js)

4. **Experiment with features:**
   - App Summary for overview
   - Tech Debt for code quality
   - Dead Code for cleanup
   - Friday Chat for Q&A

## Getting Help

### Documentation
- [README.md](./README.md) - Main documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical details
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Common Issues
- Check [Troubleshooting](#troubleshooting) section above
- Search [GitHub Issues](https://github.com/your-repo/issues)
- Check Next.js [Common Errors](https://nextjs.org/docs/messages)

### Support
- Create an issue on GitHub
- Contact your team lead
- Reach out to IBM Bob support

## Success Criteria

You've successfully set up Bob Code Analyzer when:

✅ Development server runs without errors  
✅ You can analyze a GitHub repository  
✅ Bob returns analysis results  
✅ All four tabs work correctly  
✅ No console errors in browser  
✅ TypeScript compilation succeeds  

**Congratulations! You're ready to analyze code with Bob! 🎉**