# 🚀 Railway Deployment Optimization

## Overview

This document explains how the Invoice CRM application is configured to deploy only the services that have changed, optimizing deployment time and resources on Railway.

---

## 🎯 Problem Solved

**Before:** Every git push would trigger deployment of BOTH backend and frontend services, even if only one changed.

**After:** Railway now intelligently deploys only the service whose files have changed.

---

## 📁 Configuration Files

### Backend Configuration (`railway.json`)

Located in the **root directory**, this configures the backend service.

**Watch Patterns:**
```json
"watchPatterns": [
  "src/**",           // Backend source code
  "prisma/**",        // Database schema and migrations
  "package.json",     // Backend dependencies
  "package-lock.json",
  "tsconfig.json",    // TypeScript config
  "railway.json"      // Railway config itself
]
```

**What this means:**
- Backend deploys ONLY when files in these paths change
- Frontend changes (`frontend/**`) are ignored by backend service

---

### Frontend Configuration (`frontend/railway.json`)

Located in the **frontend directory**, this configures the frontend service.

**Watch Patterns:**
```json
"watchPatterns": [
  "frontend/**"  // All frontend files
]
```

**What this means:**
- Frontend deploys ONLY when files in `frontend/` directory change
- Backend changes (`src/**`, `prisma/**`) are ignored by frontend service

---

## 🔍 How It Works

### Example 1: Frontend-Only Change
```bash
# You modify: frontend/src/pages/invoices/InvoicesPage.tsx
git add .
git commit -m "fix: Update invoice page"
git push
```

**Result:**
- ✅ Frontend service deploys
- ❌ Backend service does NOT deploy
- ⏱️ Deployment time: ~2-3 minutes (instead of 5-6 minutes)

---

### Example 2: Backend-Only Change
```bash
# You modify: src/services/invoice.service.ts
git add .
git commit -m "feat: Add new invoice logic"
git push
```

**Result:**
- ✅ Backend service deploys
- ❌ Frontend service does NOT deploy
- ⏱️ Deployment time: ~2-3 minutes (instead of 5-6 minutes)

---

### Example 3: Both Services Change
```bash
# You modify: 
# - src/routes/invoice.routes.ts (backend)
# - frontend/src/pages/invoices/InvoicesPage.tsx (frontend)
git add .
git commit -m "feat: Add new invoice feature"
git push
```

**Result:**
- ✅ Backend service deploys
- ✅ Frontend service deploys
- ⏱️ Deployment time: ~5-6 minutes (both services needed)

---

## 📊 Deployment Triggers

| File Changed | Backend Deploys | Frontend Deploys |
|--------------|----------------|------------------|
| `src/**/*.ts` | ✅ Yes | ❌ No |
| `prisma/schema.prisma` | ✅ Yes | ❌ No |
| `package.json` (root) | ✅ Yes | ❌ No |
| `frontend/src/**/*.tsx` | ❌ No | ✅ Yes |
| `frontend/package.json` | ❌ No | ✅ Yes |
| `README.md` | ❌ No | ❌ No |
| `.md` files (docs) | ❌ No | ❌ No |

---

## ⚙️ Railway Service Setup

Make sure your Railway project has TWO separate services:

### Service 1: Backend
- **Name:** `invoice-crm-backend` (or similar)
- **Root Directory:** `/` (repository root)
- **Config File:** `railway.json`
- **Environment Variables:** `DATABASE_URL`, `JWT_SECRET`, etc.

### Service 2: Frontend
- **Name:** `invoice-crm-frontend` (or similar)
- **Root Directory:** `/frontend`
- **Config File:** `frontend/railway.json`
- **Environment Variables:** `VITE_API_URL`

---

## 🎉 Benefits

1. **⚡ Faster Deployments**
   - Only changed service deploys
   - Saves 50% deployment time on single-service changes

2. **💰 Cost Savings**
   - Less build minutes used
   - Reduced resource consumption

3. **🔒 Safer Deployments**
   - Frontend bugs don't trigger backend redeployment
   - Backend changes don't restart frontend unnecessarily

4. **📈 Better Developer Experience**
   - Faster iteration cycles
   - Less waiting for deployments

---

## 🧪 Testing the Configuration

### Test 1: Frontend-Only Deployment
```bash
# Make a small frontend change
echo "// test comment" >> frontend/src/App.tsx
git add .
git commit -m "test: Frontend deployment trigger"
git push
```

**Expected:** Only frontend service shows "Deploying..." in Railway dashboard

### Test 2: Backend-Only Deployment
```bash
# Make a small backend change
echo "// test comment" >> src/server.ts
git add .
git commit -m "test: Backend deployment trigger"
git push
```

**Expected:** Only backend service shows "Deploying..." in Railway dashboard

---

## 📝 Notes

- **Documentation files** (`.md`) don't trigger any deployments
- **Root-level config changes** (`railway.json`) trigger backend deployment
- **Frontend config changes** (`frontend/railway.json`) trigger frontend deployment
- Railway checks watch patterns on every commit

---

## 🔧 Troubleshooting

### Issue: Both services still deploying on every change

**Solution:**
1. Check that you have TWO separate services in Railway
2. Verify each service has the correct root directory set
3. Ensure `railway.json` files are in the correct locations
4. Redeploy both services once after adding watch patterns

### Issue: Service not deploying when it should

**Solution:**
1. Check if the changed file matches a watch pattern
2. Verify the watch pattern syntax (use `**` for subdirectories)
3. Check Railway deployment logs for pattern matching info

---

## ✅ Verification Checklist

- [x] Backend `railway.json` has watch patterns for backend files
- [x] Frontend `railway.json` has watch patterns for frontend files
- [x] Two separate services configured in Railway dashboard
- [x] Each service has correct root directory
- [x] Environment variables set for both services
- [x] Test deployments confirm selective deployment works

---

**Last Updated:** 2026-01-28
**Status:** ✅ Optimized and Active

