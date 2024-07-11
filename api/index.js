const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

const provider = new ethers.providers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_SEPOLIA}`);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'CreditScore.sol', 'CreditScore.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));
const abi = artifact.abi;

const contractAddress = "0x4F9D18a93f10464aD5C26f70fFA9CB6438DfaE21"; // Replace with your deployed contract address
const contract = new ethers.Contract(contractAddress, abi, wallet);

// Route to fetch the credit score of a user
app.get('/credit-score/:address', async (req, res) => {
  try {
    const userAddress = req.params.address;
    const userCreditInfo = await contract.userCredits(userAddress);
    res.json({
      address: userAddress,
      creditScore: userCreditInfo.creditScore.toString()
    });
  } catch (error) {
    console.error('Error fetching credit score:', error);
    res.status(500).json({ error: 'Failed to fetch credit score' });
  }
});

// Route to integrate external data and update the credit score of a user
app.post('/integrate-external-data', async (req, res) => {
  const { user, volume, balance, frequency, mix, newTx } = req.body;

  if (!user || volume == null || balance == null || frequency == null || mix == null || newTx == null) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
    const tx = await contract.integrateExternalData(user, volume, balance, frequency, mix, newTx);
    await tx.wait();
    res.json({ message: `Credit score updated for user ${user}` });
  } catch (error) {
    console.error('Error integrating external data:', error);
    res.status(500).json({ error: 'Failed to integrate external data' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
