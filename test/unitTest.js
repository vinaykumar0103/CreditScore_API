const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CreditScore", function () {
  let CreditScore;
  let creditScore;
  let owner;
  let addr1;

  beforeEach(async function () {
    // Load the compiled contract artifacts
    const contractFactory = await ethers.getContractFactory("CreditScore");
    CreditScore = contractFactory.connect(owner); // Connect using the owner's signer

    // Deploy the contract using hre.ethers.deployContract
    creditScore = await hre.ethers.deployContract("CreditScore");

    // Get signers
    [owner, addr1] = await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await creditScore.owner()).to.equal(owner.address);
    });
  });

  describe("Transactions", function () {
    it("Should update transaction volume", async function () {
      await creditScore.connect(addr1).updateTransactionVolume(1000); // Example values for testing
      const userCreditInfo = await creditScore.userCredits(addr1.address);
      expect(userCreditInfo.transactionVolume).to.equal(1000);
    });

    it("Should update wallet balance", async function () {
      await creditScore.connect(addr1).updateWalletBalance(2000); // Example values for testing
      const userCreditInfo = await creditScore.userCredits(addr1.address);
      expect(userCreditInfo.walletBalance).to.equal(2000);
    });

    it("Should update transaction frequency", async function () {
      await creditScore.connect(addr1).updateTransactionFrequency(500);
      const userCreditInfo = await creditScore.userCredits(addr1.address);
      expect(userCreditInfo.transactionFrequency).to.equal(500);
    });

    it("Should update transaction Mix", async function () {
      await creditScore.connect(addr1).updateTransactionMix(250);
      const userCreditInfo = await creditScore.userCredits(addr1.address);
      expect(userCreditInfo.transactionMix).to.equal(250);
    });

 it("Should calculate the correct credit score", async function () {
      // Update user's transaction details
      await creditScore.connect(addr1).updateTransactionVolume(1000);
      await creditScore.connect(addr1).updateWalletBalance(2000);
      await creditScore.connect(addr1).updateTransactionFrequency(500);
      await creditScore.connect(addr1).updateTransactionMix(250);
      await creditScore.connect(addr1).updateNewTransactions(100);

      // Fetch user's credit info
      const userCreditInfo = await creditScore.userCredits(addr1.address);

      // Normalize individual components
      const normalizedTransactionVolume = 1000 / 10;
      const normalizedWalletBalance = 2000 / 10;
      const normalizedTransactionFrequency = 500 / 10;
      const normalizedTransactionMix = 250 / 10;
      const normalizedNewTransactions = 100 / 10;

      // Calculate expected score based on contract's logic
      const expectedScore = (
        (normalizedTransactionVolume * 35 / 100) +  // Transaction Volume weighted
        (normalizedWalletBalance * 30 / 100) +  // Wallet Balance weighted
        (normalizedTransactionFrequency * 15 / 100) +   // Transaction Frequency weighted
        (normalizedTransactionMix * 10 / 100) +   // Transaction Mix weighted
        (normalizedNewTransactions * 10 / 100)     // New Transactions weighted
      );

      // Ensure the weighted score is within 0-100 range before scaling
      const cappedScore = Math.min(expectedScore, 100);

      // Scale expected score to fit within the contract's credit score range (300 - 850)
      const normalizedScore = Math.round((cappedScore * (850 - 300) / 100) + 300);

      // Assert that the calculated credit score matches the expected normalized score
      expect(userCreditInfo.creditScore).to.equal(normalizedScore);
    });
  });
});
