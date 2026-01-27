@echo off
echo ========================================
echo Starting Invoice CRM Backend Server
echo ========================================
echo.
echo Killing any process using port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %%a 2>nul
echo.
echo Starting backend on http://localhost:3000
echo.
npm run dev

