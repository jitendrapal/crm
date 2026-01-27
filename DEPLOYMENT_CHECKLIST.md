# ✅ Deployment Checklist - Invoice CRM

## 🎯 Pre-Deployment Preparation

### ✅ Code Ready for Deployment

- [x] **Git repository set up** ✅
- [x] **Code pushed to GitHub** ✅
- [x] **Environment variables configured** ✅
- [x] **API URL uses environment variable** ✅
- [x] **Build scripts updated** ✅

---

## 📝 Deployment Steps

### Step 1: Choose Your Platform

**Recommended Options:**
- [ ] **Render** (easiest, free tier) ⭐⭐⭐⭐⭐
- [ ] **Vercel + Railway** (great performance) ⭐⭐⭐⭐
- [ ] **Netlify + Render** (alternative) ⭐⭐⭐⭐
- [ ] **DigitalOcean** (more control) ⭐⭐⭐
- [ ] **AWS** (enterprise) ⭐⭐⭐

**My recommendation:** Start with **Render**

---

### Step 2: Database Migration (SQLite → PostgreSQL)

**Current:** SQLite (file-based, not suitable for production)  
**Target:** PostgreSQL (production-ready)

#### Changes Needed:

1. **Update `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. **Remove SQLite-specific syntax:**
   - No changes needed (your schema is already compatible!)

3. **Update `.env` (for local testing):**
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/invoice_crm"
   ```

4. **Run migrations:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

---

### Step 3: Environment Variables

**Backend (.env):**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=<your-postgresql-connection-string>
JWT_SECRET=<generate-a-strong-random-secret>
STRIPE_SECRET_KEY=<your-stripe-key-if-using>
N8N_WEBHOOK_URL=<your-n8n-webhook-if-using>
```

**Frontend (.env):**
```
VITE_API_URL=<your-backend-url>
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Step 4: CORS Configuration

Update `src/server.ts` to allow your frontend domain:

```typescript
await fastify.register(cors, {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'https://your-frontend-domain.com',
  ],
  credentials: true,
});
```

---

### Step 5: Build & Test Locally

**Backend:**
```bash
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

**Test:**
- [ ] Backend starts without errors
- [ ] Frontend builds successfully
- [ ] Can login and use the app

---

### Step 6: Deploy to Platform

#### **Option A: Render (Recommended)**

Follow: `DEPLOY_TO_RENDER.md`

**Quick Steps:**
1. Create Render account
2. Create PostgreSQL database
3. Deploy backend web service
4. Deploy frontend static site
5. Configure environment variables
6. Test deployment

#### **Option B: Vercel + Railway**

**Railway (Backend):**
1. Connect GitHub repo
2. Add PostgreSQL database
3. Set environment variables
4. Deploy

**Vercel (Frontend):**
1. Import GitHub repo
2. Set root directory to `frontend`
3. Add VITE_API_URL environment variable
4. Deploy

---

### Step 7: Post-Deployment

- [ ] **Test login** with demo credentials
- [ ] **Create a test invoice**
- [ ] **Record a test payment**
- [ ] **Check all pages load**
- [ ] **Verify API calls work**
- [ ] **Test on mobile device**

---

### Step 8: Production Optimizations

- [ ] **Custom domain** (optional)
- [ ] **SSL certificate** (automatic on most platforms)
- [ ] **Environment variables** secured
- [ ] **Database backups** enabled
- [ ] **Monitoring** set up
- [ ] **Error tracking** (e.g., Sentry)
- [ ] **Analytics** (optional)

---

## 🔧 Files Modified for Deployment

### ✅ Already Updated:
- [x] `package.json` - Added build and migrate scripts
- [x] `frontend/src/lib/api.ts` - Uses environment variable for API URL
- [x] `render.yaml` - Render configuration file (optional)

### 📝 Need to Update:
- [ ] `prisma/schema.prisma` - Change to PostgreSQL
- [ ] `src/server.ts` - Update CORS origins
- [ ] `.env` - Add production environment variables

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:** 
- Check DATABASE_URL is correct
- Use Internal Database URL (not External)
- Verify database is running

### Issue: "CORS error"
**Solution:**
- Add frontend URL to CORS origins
- Check credentials: true is set
- Verify API URL in frontend

### Issue: "Build fails"
**Solution:**
- Check build logs
- Verify all dependencies in package.json
- Run `npm install` locally first

### Issue: "Cold start is slow"
**Solution:**
- Upgrade to paid plan (no cold starts)
- Or accept 30-second delay on first request

---

## 📊 Deployment Costs

### Free Tier:
- **Render:** Free (with limitations)
- **Vercel:** Free for frontend
- **Railway:** $5 credit/month
- **Netlify:** Free for frontend

### Production (Recommended):
- **Render:** $7/month per service ($14 total)
- **Vercel + Railway:** ~$10/month
- **DigitalOcean:** ~$12/month

---

## 🎯 Next Steps After Deployment

1. **Share your app!**
   - Send the URL to users
   - Add to your portfolio
   - Share on social media

2. **Monitor performance:**
   - Check logs regularly
   - Monitor database usage
   - Track errors

3. **Iterate and improve:**
   - Add new features
   - Fix bugs
   - Optimize performance

---

## 📚 Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Prisma Docs:** https://www.prisma.io/docs

---

## ✅ Final Checklist

Before going live:

- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database migrated
- [ ] CORS configured
- [ ] SSL enabled (automatic)
- [ ] Demo data seeded
- [ ] Login tested
- [ ] All features working
- [ ] Mobile responsive
- [ ] Error handling works

---

## 🎉 Ready to Deploy!

**Choose your platform and follow the guide:**
- **Render:** See `DEPLOY_TO_RENDER.md`
- **Other platforms:** See `DEPLOYMENT_OPTIONS.md`

**Need help?** Let me know which platform you choose and I'll guide you through it! 🚀

