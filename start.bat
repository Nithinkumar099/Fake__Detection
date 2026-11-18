@echo off
TITLE Digital Truth Layer - Startup Manager
COLOR 0B

echo ==============================================================================
echo        DIGITAL TRUTH LAYER: AI & BLOCKCHAIN INFORMATION TRUST SYSTEM
echo ==============================================================================
echo.

:: 1. Launch Hardhat Node
echo [1/4] Starting Hardhat Local Ethereum Node on port 8545...
cd /d "%~dp0blockchain"
start "Hardhat Node (Port 8545)" cmd /k "npm.cmd run node"
timeout /t 4 /nobreak > nul

:: 2. Deploy Smart Contract
echo [2/4] Deploying TruthRegistry.sol to local node...
call npm.cmd run deploy
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Contract deployment failed. Ensure Hardhat node is running on 127.0.0.1:8545.
    pause
    exit /b %ERRORLEVEL%
)

:: 3. Launch FastAPI Backend
echo [3/4] Launching FastAPI Forensics Backend on port 8000...
cd /d "%~dp0backend"
start "FastAPI Backend (Port 8000)" cmd /k "python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 3 /nobreak > nul

:: 4. Launch Next.js Dashboard
echo [4/4] Starting Next.js Cyber Dashboard on port 3000...
cd /d "%~dp0frontend"
start "Next.js Frontend (Port 3000)" cmd /k "npm.cmd run dev"

echo.
echo ==============================================================================
echo   All systems active!
echo   - Frontend:   http://localhost:3000
echo   - Backend:    http://127.0.0.1:8000
echo   - Hardhat:    http://127.0.0.1:8545
echo ==============================================================================
timeout /t 3 /nobreak > nul
start http://localhost:3000
