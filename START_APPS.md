# 🚀 How to Start Both Frontend and Backend

## ✅ Setup Complete!

Your database is configured and ready to use with SQLite (no PostgreSQL needed).

---

## 📝 Step-by-Step Instructions

### **Step 1: Start Backend** (Terminal 1)

Open your terminal in the project root directory and run:

```bash
npm run dev
```

**Expected output:**
```
Server listening at http://localhost:3000
```

**If you see errors**, try:
```bash
npx tsx src/server.ts
```

---

### **Step 2: Start Frontend** (Terminal 2)

Open a **NEW terminal** window and run:

```bash
cd frontend
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in 1234 ms

➜  Local:   http://localhost:3001/
```

---

## 🌐 Access the Application

1. Open your browser
2. Go to: **http://localhost:3001**
3. Click "Sign up" to create your account

---

## 🐛 Troubleshooting

### Backend won't start?

Try running directly:
```bash
npx tsx src/server.ts
```

### Frontend won't start?

Make sure you're in the frontend directory:
```bash
cd frontend
npm run dev
```

### Port already in use?

**For backend (port 3000):**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill it (replace PID with actual number)
taskkill /PID <PID> /F
```

**For frontend (port 3001):**
```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Kill it (replace PID with actual number)
taskkill /PID <PID> /F
```

---

## ✅ Verify Everything Works

### Check Backend
Open: http://localhost:3000/health

Should see:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### Check Frontend
Open: http://localhost:3001

Should see the login page!

---

## 🎯 What to Do Next

1. **Register** - Create your company account
2. **Add Customers** - Go to Customers → Add Customer
3. **Create Invoices** - Go to Invoices → Create Invoice
4. **Record Payments** - Go to Payments → Record Payment
5. **View Dashboard** - See your analytics

---

## 📊 Database Info

- **Type**: SQLite (file-based, no server needed)
- **Location**: `dev.db` in the project root
- **View Data**: Run `npx prisma studio` to open a GUI

---

## 🔄 Restart Both Apps

If you need to restart:

1. Press `Ctrl+C` in both terminals
2. Run the commands again:
   - Terminal 1: `npm run dev` (backend)
   - Terminal 2: `cd frontend && npm run dev` (frontend)

---

## 🎉 You're All Set!

Both apps should now be running:
- ✅ Backend: http://localhost:3000
- ✅ Frontend: http://localhost:3001

Happy coding! 🚀

