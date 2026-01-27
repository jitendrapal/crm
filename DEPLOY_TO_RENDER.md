# 🚀 Deploy Invoice CRM to Render - Step by Step

## 📋 Overview

This guide will help you deploy your Invoice CRM to **Render** (free tier).

**What you'll deploy:**
- ✅ Backend API (Node.js + Fastify)
- ✅ Frontend (React + Vite)
- ✅ PostgreSQL Database

**Time needed:** ~20-30 minutes  
**Cost:** FREE (with limitations) or $7/month for production

---

## 🎯 Prerequisites

Before starting:
- ✅ GitHub account (you have this)
- ✅ Your code pushed to GitHub ✅ (done!)
- ✅ Render account (free - we'll create this)

---

## 📝 Step 1: Create Render Account

1. Go to **https://render.com**
2. Click **"Get Started"**
3. Sign up with **GitHub** (easiest option)
4. Authorize Render to access your repositories

---

## 📝 Step 2: Create PostgreSQL Database

1. **In Render Dashboard:**
   - Click **"New +"** button
   - Select **"PostgreSQL"**

2. **Configure Database:**
   - **Name:** `invoice-crm-db`
   - **Database:** `invoice_crm`
   - **User:** (auto-generated)
   - **Region:** Choose closest to you
   - **Plan:** **Free** (or Starter $7/month for production)

3. **Click "Create Database"**

4. **Save Connection Details:**
   - Wait for database to be created (~2 minutes)
   - Copy **"Internal Database URL"** (you'll need this)
   - It looks like: `postgresql://user:pass@host/dbname`

---

## 📝 Step 3: Deploy Backend API

1. **In Render Dashboard:**
   - Click **"New +"** button
   - Select **"Web Service"**

2. **Connect Repository:**
   - Select **"Build and deploy from a Git repository"**
   - Click **"Connect account"** if needed
   - Find and select: **`jitendrapal/crm`**
   - Click **"Connect"**

3. **Configure Web Service:**
   - **Name:** `invoice-crm-backend`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** (leave empty)
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command:** `npm start`
   - **Plan:** **Free** (or Starter $7/month)

4. **Environment Variables:**
   Click **"Advanced"** → **"Add Environment Variable"**
   
   Add these variables:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<paste your Internal Database URL from Step 2>
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

5. **Click "Create Web Service"**

6. **Wait for deployment** (~5-10 minutes)
   - You'll see build logs
   - Wait for "Your service is live 🎉"
   - Copy the URL (e.g., `https://invoice-crm-backend.onrender.com`)

---

## 📝 Step 4: Deploy Frontend

1. **In Render Dashboard:**
   - Click **"New +"** button
   - Select **"Static Site"**

2. **Connect Repository:**
   - Select same repository: **`jitendrapal/crm`**
   - Click **"Connect"**

3. **Configure Static Site:**
   - **Name:** `invoice-crm-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `frontend/dist`

4. **Environment Variables:**
   Click **"Advanced"** → **"Add Environment Variable"**
   
   Add this variable:
   ```
   VITE_API_URL=<your backend URL from Step 3>
   ```
   Example: `VITE_API_URL=https://invoice-crm-backend.onrender.com`

5. **Click "Create Static Site"**

6. **Wait for deployment** (~3-5 minutes)
   - Copy the URL (e.g., `https://invoice-crm-frontend.onrender.com`)

---

## 📝 Step 5: Update Frontend API Configuration

We need to update the frontend to use the production API URL.

**Option A: Use Environment Variable (Recommended)**

1. Update `frontend/src/lib/api.ts`:
   ```typescript
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL || '/api',
   });
   ```

2. Commit and push:
   ```bash
   git add .
   git commit -m "Use environment variable for API URL"
   git push
   ```

3. Render will auto-deploy the changes

**Option B: Hardcode (Quick but not recommended)**

1. Update `frontend/src/lib/api.ts`:
   ```typescript
   const api = axios.create({
     baseURL: 'https://invoice-crm-backend.onrender.com/api',
   });
   ```

---

## 📝 Step 6: Seed Database (Optional)

To add demo data:

1. **In Render Dashboard:**
   - Go to your **backend service**
   - Click **"Shell"** tab
   - Run: `npm run seed`

Or use the Render API to run commands.

---

## 📝 Step 7: Test Your Deployment

1. **Visit your frontend URL:**
   - Example: `https://invoice-crm-frontend.onrender.com`

2. **Try to login:**
   - Email: `admin@demo.com`
   - Password: `Demo123!`

3. **If login fails:**
   - Check backend logs in Render dashboard
   - Verify DATABASE_URL is correct
   - Check CORS settings

---

## ⚙️ Step 8: Configure CORS (If Needed)

If you get CORS errors, update `src/server.ts`:

```typescript
await fastify.register(cors, {
  origin: [
    'https://invoice-crm-frontend.onrender.com',
    'http://localhost:3001', // for local development
  ],
  credentials: true,
});
```

Commit and push to redeploy.

---

## 🎯 **Your Deployed URLs**

After completion, you'll have:

- **Frontend:** `https://invoice-crm-frontend.onrender.com`
- **Backend:** `https://invoice-crm-backend.onrender.com`
- **Database:** Managed by Render

---

## ⚠️ **Important Notes**

### **Free Tier Limitations:**
- ⚠️ Services spin down after 15 minutes of inactivity
- ⚠️ First request after inactivity takes ~30 seconds (cold start)
- ⚠️ 750 hours/month free (enough for 1 service)
- ⚠️ Database limited to 1GB

### **For Production:**
- ✅ Upgrade to **Starter plan** ($7/month per service)
- ✅ No cold starts
- ✅ Better performance
- ✅ More database storage

---

## 🔧 **Troubleshooting**

### **Backend won't start:**
- Check build logs in Render dashboard
- Verify DATABASE_URL is correct
- Make sure `npm start` script exists in package.json

### **Frontend can't connect to backend:**
- Check VITE_API_URL environment variable
- Verify CORS settings in backend
- Check browser console for errors

### **Database connection fails:**
- Use **Internal Database URL** (not External)
- Check if database is running
- Verify connection string format

---

## 📚 **Next Steps**

After deployment:

1. ✅ **Custom Domain** (optional)
   - Go to Settings → Custom Domain
   - Add your domain (e.g., `invoicecrm.com`)

2. ✅ **Environment Variables**
   - Update JWT_SECRET to a strong random string
   - Add any other secrets

3. ✅ **Monitoring**
   - Check logs regularly
   - Set up alerts in Render

4. ✅ **Backups**
   - Render backs up PostgreSQL automatically
   - Consider additional backups for production

---

## 🎉 **Success!**

Your Invoice CRM is now live on the internet! 🚀

**Share your app:**
- Frontend: `https://invoice-crm-frontend.onrender.com`
- Anyone can access it!

---

**Need help? Let me know which step you're on and I'll assist!** 💪

