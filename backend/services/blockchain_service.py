import os
import json
import hashlib
import time
import subprocess
import urllib.request
from typing import Dict, Any, Optional, List

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "contract_config.json")
CLI_PATH = os.path.join(BASE_DIR, "blockchain", "scripts", "contract_cli.js")

def compute_sha256(data: bytes | str) -> str:
    """Computes standard SHA-256 hex digest of given string or bytes."""
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()

class BlockchainService:
    def __init__(self):
        self.config: Dict[str, Any] = {}
        self.connected = False
        self._load_contract()

    def _load_contract(self):
        if not os.path.exists(CONFIG_PATH):
            return

        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                self.config = json.load(f)
            self.connected = True
        except Exception as e:
            print(f"[BlockchainService] Warning loading config: {e}")
            self.connected = False

    def _ping_rpc(self) -> bool:
        """Verifies that the configured JSON-RPC Ethereum node is reachable."""
        rpc_url = self.config.get("rpc_url", "http://127.0.0.1:8545")
        payload = json.dumps({
            "jsonrpc": "2.0",
            "method": "eth_blockNumber",
            "params": [],
            "id": 1
        }).encode("utf-8")
        try:
            req = urllib.request.Request(
                rpc_url,
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return "result" in data
        except Exception:
            return False

    def is_ready(self) -> bool:
        if not self.config:
            self._load_contract()
        if not (self.config and "contract_address" in self.config):
            self.connected = False
            return False
        self.connected = self._ping_rpc()
        return self.connected

    def _run_cli(self, action: str, *args) -> Optional[Dict[str, Any] | List[Any]]:
        """Executes contract_cli.js via Node to communicate with Hardhat node."""
        if not os.path.exists(CLI_PATH):
            print(f"[BlockchainService] CLI path not found: {CLI_PATH}")
            return None

        cmd = ["node", CLI_PATH, action] + [str(a) for a in args]
        try:
            res = subprocess.run(
                cmd,
                cwd=os.path.dirname(CLI_PATH),
                capture_output=True,
                text=True,
                timeout=15
            )
            if res.returncode == 0:
                output = res.stdout.strip()
                if output:
                    return json.loads(output)
            else:
                print(f"[BlockchainService] CLI error ({action}): {res.stderr}")
        except Exception as e:
            print(f"[BlockchainService] Error invoking CLI ({action}): {e}")
        return None

    def check_existing_verification(self, content_hash: str) -> Optional[Dict[str, Any]]:
        """Queries TruthRegistry for an existing verification record by content hash."""
        if not self.is_ready():
            return None

        result = self._run_cli("get", content_hash)
        if result and isinstance(result, dict) and result.get("exists"):
            return {
                "contentHash": result["contentHash"],
                "trustScore": int(result["trustScore"]),
                "mediaType": result["mediaType"],
                "timestamp": int(result["timestamp"]),
                "exists": True,
                "verifiedFromLedger": True,
                "contractAddress": self.config.get("contract_address"),
                "network": f"Hardhat Localhost (Chain ID {self.config.get('chain_id', 31337)})"
            }
        return None

    def store_verification(self, content_hash: str, trust_score: int, media_type: str) -> Dict[str, Any]:
        """Stores a new verification record on TruthRegistry smart contract."""
        if not self.is_ready():
            return {
                "txHash": f"0xsimulated_{compute_sha256(content_hash + str(time.time()))[:40]}",
                "blockNumber": 1,
                "timestamp": int(time.time()),
                "status": "simulated_offline",
                "contractAddress": "0x0000000000000000000000000000000000000000"
            }

        result = self._run_cli("store", content_hash, int(trust_score), media_type)
        if result and isinstance(result, dict) and "txHash" in result:
            return result

        # Fallback gracefully if the local node became unreachable mid-request
        return {
            "txHash": f"0xsimulated_{compute_sha256(content_hash + str(time.time()))[:40]}",
            "blockNumber": 0,
            "timestamp": int(time.time()),
            "status": "simulated_offline",
            "contractAddress": self.config.get("contract_address", "0x0000000000000000000000000000000000000000")
        }

    def get_ledger(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieves list of stored verifications from TruthRegistry."""
        if not self.is_ready():
            return []

        result = self._run_cli("ledger", limit)
        if isinstance(result, list):
            return result
        return []

# Singleton instance
blockchain_service = BlockchainService()
