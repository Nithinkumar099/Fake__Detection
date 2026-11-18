const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment of TruthRegistry...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const TruthRegistry = await hre.ethers.getContractFactory("TruthRegistry");
  const truthRegistry = await TruthRegistry.deploy();
  await truthRegistry.waitForDeployment();

  const contractAddress = await truthRegistry.getAddress();
  console.log("TruthRegistry deployed to:", contractAddress);

  // Extract ABI from compiled artifacts
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/TruthRegistry.sol/TruthRegistry.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  // Default hardhat node #0 private key
  const defaultPrivateKey =
    process.env.PRIVATE_KEY ||
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

  const config = {
    contract_address: contractAddress,
    rpc_url: "http://127.0.0.1:8545",
    chain_id: 31337,
    deployer_address: deployer.address,
    deployer_private_key: defaultPrivateKey,
    abi: artifact.abi
  };

  // Export to backend directory
  const backendDir = path.join(__dirname, "../../backend");
  if (!fs.existsSync(backendDir)) {
    fs.mkdirSync(backendDir, { recursive: true });
  }

  const outputPath = path.join(backendDir, "contract_config.json");
  fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
  console.log("Contract configuration exported successfully to:", outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
