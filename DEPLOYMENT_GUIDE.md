# 📘 Netlify Deployment Guide - Step by Step

## Prerequisites
- ✅ Netlify account created
- ✅ GitHub account (free)
- ✅ Project files downloaded

---

## 🎯 Method 1: Deploy via GitHub (Recommended)

### Step 1: Create a GitHub Repository

1. Go to https://github.com and sign in
2. Click the **"+"** button (top right) → **"New repository"**
3. Repository settings:
   - Name: `crypto-trend-scanner` (or any name you like)
   - Description: "Advanced crypto trend scanner"
   - Make it **Public** or **Private** (your choice)
   - **Don't** initialize with README (we have our own)
4. Click **"Create repository"**

### Step 2: Upload Your Project to GitHub

**Option A: Using GitHub Web Interface (Easiest)**

1. On your new repository page, click **"uploading an existing file"**
2. Drag and drop ALL files from the `crypto-scanner-app` folder:
   - `src/` folder (with all .jsx and .css files inside)
   - `index.html`
   - `package.json`
   - `vite.config.js`
   - `tailwind.config.js`
   - `postcss.config.js`
   - `netlify.toml`
   - `.gitignore`
   - `README.md`
3. Write a commit message: "Initial commit"
4. Click **"Commit changes"**

**Option B: Using Git Command Line** (if you're comfortable with terminal)

```bash
# Navigate to your project folder
cd crypto-scanner-app

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Connect to your GitHub repo (replace YOUR-USERNAME and YOUR-REPO)
git remote add origin https://github.com/YOUR-USERNAME/crypto-trend-scanner.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Connect GitHub to Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub (if first time)
5. Select your repository: `crypto-trend-scanner`

### Step 4: Configure Build Settings

Netlify should auto-detect these settings:

- **Build command**: `npm run build` ✅
- **Publish directory**: `dist` ✅
- **Base directory**: (leave empty) ✅

If not auto-detected, enter them manually.

### Step 5: Deploy!

1. Click **"Deploy site"**
2. Wait 2-3 minutes for build to complete
3. You'll see: **"Site is live"** with a URL like: `https://random-name-12345.netlify.app`

### Step 6: (Optional) Customize Your Domain

1. Click **"Domain settings"**
2. Click **"Options"** → **"Edit site name"**
3. Change to something like: `my-crypto-scanner`
4. Your new URL: `https://my-crypto-scanner.netlify.app`

---

## 🚀 Method 2: Deploy via Netlify Drop (Quickest)

### Step 1: Build Locally First

You need Node.js installed for this method.

1. Open terminal/command prompt
2. Navigate to project folder:
   ```bash
   cd crypto-scanner-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. This creates a `dist` folder with your built files

### Step 2: Drag & Drop to Netlify

1. Go to https://app.netlify.com/drop
2. Drag the entire `dist` folder onto the upload area
3. Wait for upload to complete
4. Your site is live instantly!

**Note**: This method doesn't connect to GitHub, so you'll need to manually re-upload the `dist` folder each time you make changes.

---

## ✅ Verification Steps

After deployment:

1. Click the live site URL
2. You should see the **"Advanced Crypto Scanner"** interface
3. Click **"Start Advanced Scan"** or toggle to **Demo Mode**
4. Verify that:
   - Assets load and display
   - You can expand/collapse asset details
   - Technical indicators show (RSI, MACD, Volume)
   - ROI scores calculate correctly

---

## 🔧 Troubleshooting

### Build Failed

**Error**: "Command failed: npm run build"

**Solution**: Make sure all these files are in your repo:
- `package.json`
- `vite.config.js`
- `index.html`
- `src/` folder with all components

### Blank Page After Deploy

**Error**: Site loads but shows blank page

**Solution**: 
1. Check browser console (F12) for errors
2. Make sure `netlify.toml` is included (handles routing)
3. Redeploy: Settings → Deploys → Trigger deploy

### API Not Working

**Issue**: Shows "Demo Mode" even on live site

**Solution**: This is normal! The Binance API should work on Netlify. If it doesn't:
1. Check browser console for CORS errors
2. Binance API might be rate-limiting you
3. Demo mode is a fallback and still demonstrates functionality

---

## 🎨 Customization After Deploy

### Update the Scanner

1. Make changes to your code locally
2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Updated scanner features"
   git push
   ```
3. Netlify automatically rebuilds and deploys! (takes 2-3 min)

### Environment Variables (if needed later)

1. In Netlify dashboard → Site settings
2. Build & deploy → Environment variables
3. Add variables like API keys if you add them later

---

## 📊 What You Should See After Deployment

Your live scanner will have:

- ✅ Clean, professional dark interface
- ✅ Crypto assets with ROI scores
- ✅ Expandable details per asset
- ✅ Technical indicators (RSI, MACD, Volume)
- ✅ Pattern recognition badges
- ✅ Support/Resistance levels
- ✅ Configurable settings panel
- ✅ Real-time data from Binance API

---

## 🎯 Quick Deploy Checklist

- [ ] GitHub account created
- [ ] Repository created on GitHub
- [ ] Project files uploaded to repository
- [ ] Netlify account created
- [ ] Repository connected to Netlify
- [ ] Build settings configured
- [ ] Site deployed successfully
- [ ] Tested on live URL
- [ ] (Optional) Custom domain set

---

## 📞 Need Help?

Common resources:
- Netlify Docs: https://docs.netlify.com
- Netlify Support: https://www.netlify.com/support/
- Vite Docs: https://vitejs.dev

**Pro Tip**: Netlify's auto-deploy from GitHub is incredibly convenient. Every time you push changes to your repository, Netlify automatically rebuilds and deploys your site!

---

## 🎉 Congratulations!

Once deployed, share your scanner URL with others or bookmark it for your own crypto analysis. The scanner will work with real-time Binance data and provide professional-grade technical analysis!
