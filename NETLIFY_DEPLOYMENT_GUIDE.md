# Netlify Deployment Guide

## Prerequisites
1. A Netlify account (sign up at https://netlify.com)
2. GitHub Personal Access Token
3. Google Gemini API Key

## Step-by-Step Deployment

### 1. Prepare Your Repository

First, ensure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

```bash
# If not already initialized
git init
git add .
git commit -m "Ready for Netlify deployment"

# Push to your remote repository
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy to Netlify

#### Option A: Deploy via Netlify Dashboard (Recommended)

1. **Log in to Netlify**
   - Go to https://app.netlify.com
   - Sign in with your GitHub/GitLab/Bitbucket account

2. **Import Your Project**
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider (GitHub/GitLab/Bitbucket)
   - Authorize Netlify to access your repositories
   - Select your `bob_code_analyzer` repository

3. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: 18 (already configured in netlify.toml)

4. **Set Environment Variables**
   Click "Show advanced" → "New variable" and add:
   
   ```
   GITHUB_TOKEN=your_github_personal_access_token
   GEMINI_API_KEY=your_gemini_api_key
   MAX_FILES_PER_REPO=50
   CACHE_DURATION_MS=3600000
   ```

   **Important**: Never commit these values to your repository!

5. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete (usually 2-5 minutes)
   - Your site will be live at a URL like: `https://random-name-123456.netlify.app`

#### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize Netlify in your project
netlify init

# Follow the prompts:
# - Create & configure a new site
# - Choose your team
# - Site name (optional)
# - Build command: npm run build
# - Publish directory: .next

# Set environment variables
netlify env:set GITHUB_TOKEN "your_github_token"
netlify env:set GEMINI_API_KEY "your_gemini_api_key"
netlify env:set MAX_FILES_PER_REPO "50"
netlify env:set CACHE_DURATION_MS "3600000"

# Deploy
netlify deploy --prod
```

### 3. Configure Custom Domain (Optional)

1. In Netlify Dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Enable HTTPS (automatic with Netlify)

### 4. Post-Deployment Configuration

#### Enable Automatic Deploys
- Go to "Site settings" → "Build & deploy"
- Under "Continuous deployment", ensure "Auto publishing" is enabled
- Every push to your main branch will trigger a new deployment

#### Configure Deploy Notifications
- Go to "Site settings" → "Build & deploy" → "Deploy notifications"
- Add notifications for:
  - Deploy started
  - Deploy succeeded
  - Deploy failed

### 5. Verify Deployment

1. **Check Build Logs**
   - Go to "Deploys" tab
   - Click on the latest deploy
   - Review build logs for any errors

2. **Test Your Application**
   - Visit your Netlify URL
   - Test repository analysis functionality
   - Verify all features work correctly

3. **Monitor Performance**
   - Go to "Analytics" tab
   - Monitor page load times
   - Check for any errors

## Troubleshooting

### Build Fails

**Issue**: Build command fails
```bash
# Check your build locally first
npm run build
```

**Solution**: Ensure all dependencies are in package.json and committed

### Environment Variables Not Working

**Issue**: API calls fail with authentication errors

**Solution**: 
1. Verify environment variables are set in Netlify Dashboard
2. Redeploy the site after adding variables
3. Check variable names match exactly (case-sensitive)

### Next.js API Routes Not Working

**Issue**: 404 errors on API routes

**Solution**: 
- Ensure `@netlify/plugin-nextjs` is in netlify.toml (already configured)
- Check that API routes are in `src/pages/api/` directory
- Verify netlify.toml redirects are correct

### Rate Limiting Issues

**Issue**: Gemini API quota exceeded

**Solution**:
- The free tier has limits (20 requests/day for gemini-2.5-flash)
- Consider upgrading to a paid plan
- Implement caching to reduce API calls
- Add rate limiting on the frontend

## Updating Your Deployment

### Automatic Updates
```bash
# Simply push to your main branch
git add .
git commit -m "Update feature"
git push origin main
# Netlify will automatically deploy
```

### Manual Deploy
```bash
# Using Netlify CLI
netlify deploy --prod

# Or trigger from Dashboard
# Go to "Deploys" → "Trigger deploy" → "Deploy site"
```

## Security Best Practices

1. **Never commit sensitive data**
   - Keep `.env` in `.gitignore`
   - Use Netlify environment variables

2. **Rotate API keys regularly**
   - Update in Netlify Dashboard
   - Redeploy after updating

3. **Monitor usage**
   - Check GitHub API rate limits
   - Monitor Gemini API quota
   - Set up alerts for unusual activity

4. **Enable HTTPS**
   - Netlify provides free SSL certificates
   - Force HTTPS in Netlify settings

## Cost Considerations

### Netlify Free Tier Includes:
- 100 GB bandwidth/month
- 300 build minutes/month
- Automatic HTTPS
- Continuous deployment
- Form handling

### Paid Plans Start At:
- Pro: $19/month (more bandwidth, build minutes)
- Business: $99/month (team features, advanced security)

### External API Costs:
- **GitHub API**: Free (5,000 requests/hour authenticated)
- **Gemini API**: Free tier (20 requests/day), then pay-as-you-go

## Support Resources

- Netlify Documentation: https://docs.netlify.com
- Netlify Community: https://answers.netlify.com
- Next.js on Netlify: https://docs.netlify.com/frameworks/next-js/overview/
- Status Page: https://www.netlifystatus.com

## Quick Commands Reference

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize site
netlify init

# Set environment variable
netlify env:set KEY "value"

# List environment variables
netlify env:list

# Deploy to production
netlify deploy --prod

# Open site in browser
netlify open:site

# Open admin dashboard
netlify open:admin

# View build logs
netlify watch

# Link to existing site
netlify link
```

## Next Steps After Deployment

1. ✅ Test all features thoroughly
2. ✅ Set up monitoring and alerts
3. ✅ Configure custom domain (optional)
4. ✅ Enable analytics
5. ✅ Set up error tracking (e.g., Sentry)
6. ✅ Document your deployment process
7. ✅ Share your live URL!

---

**Your site is now live! 🎉**

Need help? Check the troubleshooting section or reach out to Netlify support.