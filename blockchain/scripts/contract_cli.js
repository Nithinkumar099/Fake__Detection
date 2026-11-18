const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
  const args = process.argv.slice(2);
  const action = args[0];

  const configPath = path.join(__dirname, "../../backend/contract_config.json");
  if (!fs.existsSync(configPath)) {
    console.error(JSON.stringify({ error: "contract_config.json not found" }));
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const provider = new ethers.JsonRpcProvider(config.rpc_url || "http://127.0.0.1:8545");
  const wallet = new ethers.Wallet(config.deployer_private_key, provider);
  const contract = new ethers.Contract(config.contract_address, config.abi, wallet);

  if (action === "get") {
    const hash = args[1];
    const record = await contract.getVerification(hash);
    const result = {
      contentHash: record.contentHash,
      trustScore: Number(record.trustScore),
      mediaType: record.mediaType,
      timestamp: Number(record.timestamp),
      exists: record.exists,
      verifiedFromLedger: record.exists,
      contractAddress: config.contract_address,
      network: `Hardhat Localhost (Chain ID ${config.chain_id || 31337})`
    };
    console.log(JSON.stringify(result));
  } else if (action === "store") {
    const hash = args[1];
    const score = parseInt(args[2], 10);
    const mediaType = args[3];

    const tx = await contract.storeVerification(hash, score, mediaType);
    const receipt = await tx.wait();
    const block = await provider.getBlock(receipt.blockNumber);

    const result = {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      timestamp: block.timestamp,
      status: "confirmed",
      contractAddress: config.contract_address,
      network: `Hardhat Localhost (Chain ID ${config.chain_id || 31337})`
    };
    console.log(JSON.stringify(result));
  } else if (action === "ledger") {
    const limit = parseInt(args[1] || "50", 10);
    const records = await contract.getRecentRecords(limit);
    const formatted = records
      .filter((r) => r.exists)
      .map((r) => ({
        contentHash: r.contentHash,
        trustScore: Number(r.trustScore),
        mediaType: r.mediaType,
        timestamp: Number(r.timestamp),
        contractAddress: config.contract_address
      }));
    console.log(JSON.stringify(formatted));
  } else {
    console.error(JSON.stringify({ error: "Unknown action" }));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
