@echo off
echo ========================================
echo Starting Invoice CRM Frontend Server
echo ========================================
echo.
echo Killing any process using port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /F /PID %%a 2>nul
echo.
cd frontend
echo Starting frontend on http://localhost:3001
echo.
npm run dev

