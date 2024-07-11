require('dotenv').config();
const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

async function fetchExternalData(user) {
  // Mocked function to fetch external data
  return {
    volume: 100,
    balance: 200,
    frequency: 50,
    mix: 25,
    newTx: 10,
  };
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_SEPOLIA}`);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // Path to your artifact file
  const artifactPath = path.join(__dirname, 'artifacts', 'contracts', 'CreditScore.sol', 'CreditScore.json');

  // Read the artifact file to get ABI
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));
  const abi = artifact.abi;

  const contractAddress = "0x4F9D18a93f10464aD5C26f70fFA9CB6438DfaE21";
  const contract = new ethers.Contract(contractAddress, abi, wallet);

  const user = "0x71252e5fDd7aE56FA390DfFe7B242D5651E061b0";
  const data = await fetchExternalData(user);

  const tx = await contract.integrateExternalData(user, data.volume, data.balance, data.frequency, data.mix, data.newTx);
  await tx.wait();

  console.log("External data integrated successfully");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
