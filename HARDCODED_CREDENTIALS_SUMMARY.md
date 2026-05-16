# 🔑 Hardcoded Credentials Summary

**Date:** 2026-05-16  
**Status:** Credentials hardcoded into server-side code

---

## ⚠️ IMPORTANT SECURITY NOTE

The API credentials have been **hardcoded directly into the server-side code** as requested. This approach is suitable for:
- Quick testing and development
- Single-deployment scenarios
- When you control the deployment environment

**However, for production use, consider:**
- Using environment variables in your deployment platform (Netlify, Vercel, etc.)
- Rotating credentials regularly
- Not committing these files to public repositories

---

## 📝 Changes Made

### 1. GitHub API Credentials - `src/lib/github.ts`

**Hardcoded values:**
```typescript
const GITHUB_TOKEN = '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';
const MAX_FILES = 50;
```

**What was changed:**
- Removed `process.env.MAX_FILES_PER_REPO` reference
- Removed `process.env.GITHUB_TOKEN` reference
- Hardcoded GitHub Personal Access Token directly
- Simplified `getHeaders()` function to always use the hardcoded token

**Lines modified:** 8-12, 44-53

---

### 2. Bob API Credentials - `src/lib/bob.ts`

**Hardcoded values:**
```typescript
const BOB_API_URL = 'https://api.jp-tok.dataplatform.cloud.ibm.com/semantic_agents/public/v1/mcp_server/mcp';
const BOB_API_KEY = 'bob_prod_bob-user_4VfvGxQZPcyX5Ts3hLaHMH4wokYUzki3dvn9tWNKorXtw2XWkApTfTBFoFgrW1yRU1LkizNmDnr8cs5dpJ9FGd34_814VqBNuf4aZHnkMGURzJHda1Q7GK1Ysf1N3RSxMyNyyM';
const BOB_TEAM_ID = '';
const CACHE_DURATION_MS = 3600000;
```

**What was changed:**
- Removed import of `load-credentials.ts` module
- Removed all `process.env` references
- Removed `getBobApiKey()` and `getBobTeamId()` function calls
- Hardcoded Bob API URL and API key directly
- Removed all mock mode checks (no longer needed)
- Simplified all functions to use hardcoded values

**Lines modified:** 6-13, 92-258 (complete rewrite)

---

## ✅ Verification Checklist

### Server-Side Only ✅
- [x] All credentials are in `src/lib/` files (server-side only)
- [x] No credentials in `src/pages/index.tsx` (client-side)
- [x] No credentials in `next.config.js` (removed env section)
- [x] Credentials only accessible from API routes

### API Routes ✅
All API routes automatically have access to these credentials through imports:
- [x] `/api/analyze/summary` - imports `src/lib/github.ts` and `src/lib/bob.ts`
- [x] `/api/analyze/techdebt` - imports `src/lib/github.ts` and `src/lib/bob.ts`
- [x] `/api/analyze/deadcode` - imports `src/lib/github.ts` and `src/lib/bob.ts`
- [x] `/api/analyze/chat` - imports `src/lib/github.ts` and `src/lib/bob.ts`
- [x] `/api/analyze/code` - imports `src/lib/bob.ts`

### No Environment Variables Needed ✅
- [x] `.env` file is no longer required
- [x] `.env.example` can be ignored (kept for reference)
- [x] No need to set environment variables in Netlify dashboard

---

## 🧪 Testing Instructions

### 1. Type Check (Verify TypeScript)
```bash
npm run type-check
```
Expected: No errors

### 2. Build Test
```bash
npm run build
```
Expected: Build succeeds without errors

### 3. Local Development Test
```bash
npm run dev
```
Then visit http://localhost:3000 and test:
- Paste a GitHub repository URL (e.g., `vercel/next.js`)
- Click analyze
- Verify it fetches the repository and analyzes it
- Check browser console for no errors
- Check terminal for successful API calls

### 4. Test GitHub API Connection
The app should be able to:
- ✅ Fetch public repositories without issues
- ✅ Parse repository URLs correctly
- ✅ Download file contents
- ✅ Build context for Bob API

### 5. Test Bob API Connection
The app should be able to:
- ✅ Send analysis requests to Bob API
- ✅ Receive responses successfully
- ✅ Display analysis results in the UI
- ✅ Handle errors gracefully

---

## 🔒 Security Considerations

### What's Secure ✅
1. **Server-side only**: Credentials are in `src/lib/` files that only run on the server
2. **Not in client bundle**: Credentials won't appear in browser JavaScript
3. **API routes protected**: Only server-side API routes can access these credentials
4. **No exposure in next.config.js**: Removed the dangerous `env` section

### What to Watch Out For ⚠️
1. **Don't commit to public repos**: If this is a public GitHub repo, these credentials are now visible
2. **Rotate credentials**: Consider rotating these keys periodically
3. **Monitor usage**: Watch for unexpected API usage that might indicate key compromise
4. **Rate limiting**: GitHub and Bob APIs have rate limits - monitor your usage

---

## 📦 Deployment to Netlify

### No Environment Variables Needed!
Since credentials are hardcoded, you don't need to set any environment variables in Netlify.

### Deployment Steps:
1. Push your code to GitHub (or your Git provider)
2. Connect repository to Netlify
3. Netlify will auto-detect Next.js settings from `netlify.toml`
4. Click "Deploy site"
5. That's it! No environment variables to configure.

### Verify Deployment:
- ✅ Site builds successfully
- ✅ API routes work (test with a repository URL)
- ✅ No errors in Netlify function logs
- ✅ Analysis completes successfully

---

## 🔄 If You Need to Change Credentials Later

### To Update GitHub Token:
Edit `src/lib/github.ts` line 11:
```typescript
const GITHUB_TOKEN = 'your_new_token_here';
```

### To Update Bob API Credentials:
Edit `src/lib/bob.ts` lines 10-11:
```typescript
const BOB_API_URL = 'your_new_url_here';
const BOB_API_KEY = 'your_new_key_here';
```

Then redeploy to Netlify (push to Git or manual deploy).

---

## 📊 Current Configuration

| Setting | Value | Location |
|---------|-------|----------|
| GitHub Token | `github_pat_11BIXA2HI0...` | `src/lib/github.ts:11` |
| Bob API URL | `https://api.jp-tok.dataplatform...` | `src/lib/bob.ts:10` |
| Bob API Key | `bob_prod_bob-user_4VfvGxQZPc...` | `src/lib/bob.ts:11` |
| Bob Team ID | *(empty)* | `src/lib/bob.ts:12` |
| Max Files | `50` | `src/lib/github.ts:9` |
| Cache Duration | `3600000` ms (1 hour) | `src/lib/bob.ts:13` |

---

## 🎯 Next Steps

1. ✅ **Test locally** - Run `npm run dev` and test with a real repository
2. ✅ **Verify API connections** - Check that both GitHub and Bob APIs respond
3. ✅ **Deploy to Netlify** - Push to Git and deploy
4. ✅ **Test production** - Verify everything works on the live site
5. ✅ **Monitor logs** - Check Netlify function logs for any errors

---

## 📞 Troubleshooting

### If GitHub API fails:
- Check that the token is valid (not expired)
- Verify the token has correct permissions
- Check GitHub API rate limits

### If Bob API fails:
- Verify the API URL is correct
- Check that the API key is valid
- Look at the error message in console logs
- Check Bob API documentation for endpoint changes

### If build fails:
- Run `npm run type-check` to find TypeScript errors
- Check that all imports are correct
- Verify no syntax errors in modified files

---

## ✅ Summary

All API credentials have been successfully hardcoded into the server-side code:
- ✅ GitHub token hardcoded in `src/lib/github.ts`
- ✅ Bob API credentials hardcoded in `src/lib/bob.ts`
- ✅ All `process.env` references removed
- ✅ No environment variables needed
- ✅ Ready for deployment to Netlify

The application is now configured to work immediately without any environment variable setup!