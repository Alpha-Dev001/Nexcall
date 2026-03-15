# 🚀 Quick Live Deployment Guide

## Option 1: Render (Recommended - Free)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/yourusername/nexcall.git
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: nexcall
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Add Environment Variables
In Render dashboard → Environment Variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://alphamnzr_db_user:HdlbRzXQwaAsUmz4@cluster0.3swyvap.mongodb.net/VD_app_db?appName=Cluster0
JWT_SECRET=your-generated-secret-here
CORS_ORIGIN=https://your-app-name.onrender.com
```

### Step 4: Deploy!
- Click "Create Web Service"
- Wait 2-3 minutes for deployment
- Your app will be live at: `https://your-app-name.onrender.com`

---

## Option 2: Vercel (Also Free)

### Install and Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project folder
vercel

# Follow prompts to add environment variables
```

---

## Option 3: Railway (Free Tier)

### Quick Deploy
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

---

## ✅ After Deployment

1. **Test your live app** with the provided URL
2. **Update CORS_ORIGIN** to your live URL if needed
3. **Share the URL** with users to test video calls

## 🔧 Generate JWT Secret
Run this for a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📱 Mobile Access
Your live app will work on mobile browsers too! Users can:
- Join video calls from phones
- Use both cameras and microphones
- No app installation required

---

**⏱️ Time to go live: 5-10 minutes**
