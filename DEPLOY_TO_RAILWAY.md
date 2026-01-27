# 🚂 Deploy Invoice CRM to Railway - Step by Step

## 📋 Overview

This guide will help you deploy your Invoice CRM to **Railway**.

**What you'll deploy:**
- ✅ Backend API (Node.js + Fastify)
- ✅ PostgreSQL Database
- ✅ Frontend (React + Vite) - Deploy separately to Vercel/Netlify

**Time needed:** ~15-20 minutes  
**Cost:** FREE $5 credit/month (enough for small projects)

---

## 🎯 Why Railway?

- ✅ **$5 free credit/month** - Generous free tier
- ✅ **PostgreSQL included** - One-click database
- ✅ **Auto-deploy from GitHub** - Push to deploy
- ✅ **Great developer experience** - Beautiful UI
- ✅ **Environment variables** - Easy management
- ✅ **No cold starts** - Always running (unlike Render free tier)
- ✅ **Fast deployments** - Quick build times

---

## 📝 Step 1: Create Railway Account

1. Go to **https://railway.app**
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with **GitHub** (recommended)
4. Authorize Railway to access your repositories

**You'll get $5 free credit/month!**

---

## 📝 Step 2: Create New Project

1. **In Railway Dashboard:**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**

2. **Connect Repository:**
   - Find and select: **`jitendrapal/crm`**
   - Click **"Deploy Now"**

3. **Railway will:**
   - Detect it's a Node.js project
   - Start building automatically
   - ⚠️ **It will fail** - that's OK! We need to configure it first

---

## 📝 Step 3: Add PostgreSQL Database

1. **In your Railway project:**
   - Click **"+ New"** button
   - Select **"Database"**
   - Choose **"PostgreSQL"**

2. **Database created!**
   - Railway automatically creates the database
   - Connection details are auto-generated
   - Click on the PostgreSQL service to see details

3. **Get Database URL:**
   - Click on **PostgreSQL** service
   - Go to **"Variables"** tab
   - Copy the **`DATABASE_URL`** value
   - It looks like: `postgresql://postgres:password@host:5432/railway`

---

## 📝 Step 4: Configure Backend Service

1. **Click on your backend service** (the one that failed)

2. **Add Environment Variables:**
   - Go to **"Variables"** tab
   - Click **"+ New Variable"**
   
   Add these variables:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
   ```

   **Note:** `${{Postgres.DATABASE_URL}}` automatically references your PostgreSQL database!

3. **Configure Build Settings:**
   - Go to **"Settings"** tab
   - Scroll to **"Build"** section
   
   **Build Command:**
   ```
   npm install && npx prisma generate && npx prisma migrate deploy
   ```
   
   **Start Command:**
   ```
   npm start
   ```

4. **Set Root Directory:**
   - In **"Settings"** → **"Source"**
   - **Root Directory:** Leave empty (root of repo)

5. **Redeploy:**
   - Go to **"Deployments"** tab
   - Click **"Deploy"** or it will auto-deploy

---

## 📝 Step 5: Wait for Deployment

1. **Watch the build logs:**
   - You'll see npm install, Prisma generate, migrations
   - Wait for "Build successful"
   - Then wait for "Deployment successful"

2. **Get your backend URL:**
   - Go to **"Settings"** tab
   - Scroll to **"Networking"**
   - Click **"Generate Domain"**
   - Copy the URL (e.g., `https://your-app.up.railway.app`)

---

## 📝 Step 6: Deploy Frontend to Vercel

**Railway is best for backend. For frontend, use Vercel (free, optimized for React).**

### **Deploy to Vercel:**

1. **Go to https://vercel.com**
2. **Sign up with GitHub**
3. **Click "Add New Project"**
4. **Import your repository:** `jitendrapal/crm`
5. **Configure:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

6. **Environment Variables:**
   Click **"Environment Variables"**
   
   Add:
   ```
   VITE_API_URL=<your-railway-backend-url>
   ```
   Example: `VITE_API_URL=https://your-app.up.railway.app`

7. **Click "Deploy"**

8. **Wait for deployment** (~2-3 minutes)

9. **Copy your frontend URL** (e.g., `https://your-app.vercel.app`)

---

## 📝 Step 7: Update CORS in Backend

Now we need to allow your Vercel frontend to access the Railway backend.

**Update `src/server.ts`:**

```typescript
await fastify.register(cors, {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'https://your-app.vercel.app',  // Add your Vercel URL
  ],
  credentials: true,
});
```

**Commit and push:**
```bash
git add .
git commit -m "Update CORS for production frontend"
git push
```

Railway will auto-deploy the changes!

---

## 📝 Step 8: Seed Database (Optional)

To add demo data:

1. **In Railway Dashboard:**
   - Click on your backend service
   - Go to **"Settings"** tab
   - Scroll to **"Deploy"** section
   - Under **"Custom Start Command"**, temporarily change to:
   ```
   npm run seed && npm start
   ```

2. **Redeploy** - This will seed the database once

3. **Change back to:**
   ```
   npm start
   ```

**Or use Railway CLI:**
```bash
railway login
railway link
railway run npm run seed
```

---

## 📝 Step 9: Test Your Deployment

1. **Visit your frontend URL:**
   - Example: `https://your-app.vercel.app`

2. **Try to login:**
   - Email: `admin@demo.com`
   - Password: `Demo123!`

3. **Test features:**
   - Create a customer
   - Create an invoice
   - Record a payment
   - Check dashboard

---

## 🎯 Your Deployed URLs

After completion:

- **Frontend (Vercel):** `https://your-app.vercel.app`
- **Backend (Railway):** `https://your-app.up.railway.app`
- **Database:** Managed by Railway (PostgreSQL)

---

## 💰 Railway Pricing

### **Free Tier:**
- **$5 credit/month** (resets monthly)
- Usage-based pricing
- ~500 hours of runtime
- Perfect for small projects

### **Typical Usage:**
- Backend service: ~$3-5/month
- PostgreSQL: ~$1-2/month
- **Total: ~$5/month** (covered by free credit!)

### **If you exceed $5:**
- Add a credit card
- Pay only for what you use
- ~$5-10/month for production

---

## ⚙️ Alternative: Deploy Frontend to Railway Too

If you want everything on Railway:

1. **Create another service:**
   - Click **"+ New"** → **"GitHub Repo"**
   - Select same repo: `jitendrapal/crm`

2. **Configure:**
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve -s dist -l $PORT`

3. **Add dependency:**
   Update `frontend/package.json`:
   ```json
   "dependencies": {
     "serve": "^14.2.1"
   }
   ```

4. **Environment Variables:**
   ```
   VITE_API_URL=${{Backend.RAILWAY_PUBLIC_DOMAIN}}
   ```

**But Vercel is better for frontend (free, faster, CDN).**

---

## 🔧 Troubleshooting

### **Build fails:**
- Check build logs in Railway
- Verify `package.json` has all dependencies
- Make sure Prisma schema is valid

### **Database connection fails:**
- Use `${{Postgres.DATABASE_URL}}` variable reference
- Check database is running
- Verify migrations ran successfully

### **Frontend can't connect to backend:**
- Check VITE_API_URL is correct
- Verify CORS settings in backend
- Check browser console for errors

### **"Out of credits" error:**
- Add a credit card to Railway
- Or optimize usage
- Or wait for monthly reset

---

## 📊 Monitoring

**Railway provides:**
- ✅ Real-time logs
- ✅ Metrics (CPU, memory, network)
- ✅ Deployment history
- ✅ Environment variables management

**Access logs:**
- Click on service
- Go to **"Deployments"** tab
- Click on a deployment
- View logs in real-time

---

## 🚀 Next Steps

After deployment:

1. **Custom Domain** (optional)
   - Go to Settings → Networking
   - Add custom domain
   - Update DNS records

2. **Environment Variables**
   - Update JWT_SECRET to a strong random string
   - Add Stripe keys if using payments
   - Add n8n webhook URL if using automation

3. **Monitoring**
   - Check logs regularly
   - Monitor usage in Railway dashboard
   - Set up alerts

4. **Backups**
   - Railway backs up PostgreSQL automatically
   - Consider additional backups for production

---

## ✅ Deployment Checklist

- [ ] Railway account created
- [ ] PostgreSQL database created
- [ ] Backend deployed to Railway
- [ ] Environment variables configured
- [ ] Frontend deployed to Vercel
- [ ] CORS updated
- [ ] Database seeded (optional)
- [ ] Login tested
- [ ] All features working
- [ ] Custom domain added (optional)

---

## 🎉 Success!

Your Invoice CRM is now live! 🚀

**Railway (Backend):** Fast, reliable, great DX  
**Vercel (Frontend):** Optimized for React, global CDN

**Total Cost:** FREE (with $5 Railway credit + Vercel free tier)

---

**Need help? Let me know which step you're on!** 💪

