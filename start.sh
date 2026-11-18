#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

echo "=============================================================================="
echo "       DIGITAL TRUTH LAYER: AI & BLOCKCHAIN INFORMATION TRUST SYSTEM"
echo "=============================================================================="

# 1. Start Hardhat Node
echo "[1/4] Starting Hardhat Local Node on port 8545..."
cd "$DIR/blockchain"
npx hardhat node --port 8545 > "$DIR/hardhat_node.log" 2>&1 &
HARDHAT_PID=$!
sleep 4

# 2. Deploy Smart Contract
echo "[2/4] Deploying TruthRegistry.sol..."
npx hardhat run scripts/deploy.js --network localhost

# 3. Start FastAPI Backend
echo "[3/4] Launching FastAPI Backend on port 8000..."
cd "$DIR/backend"
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload > "$DIR/backend.log" 2>&1 &
BACKEND_PID=$!
sleep 3

# 4. Start Next.js Frontend
echo "[4/4] Starting Next.js Frontend on port 3000..."
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=============================================================================="
echo "  All systems active!"
echo "  - Frontend:   http://localhost:3000"
echo "  - Backend:    http://127.0.0.1:8000"
echo "  - Hardhat:    http://127.0.0.1:8545"
echo "=============================================================================="

trap "kill $HARDHAT_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null || true" EXIT
wait
