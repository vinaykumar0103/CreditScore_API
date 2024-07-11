const hre = require("hardhat");

async function main() {
  // Deploying CreditScore contract
  const creditScore = await hre.ethers.deployContract("CreditScore", [], {});

  // Wait for deployment confirmation
  await creditScore.waitForDeployment();

  console.log("CreditScore contract deployed to:", creditScore.target);
}

//  async/await and error handling
main().catch((error) => {
  console.error("Error deploying contract:", error);
  process.exitCode = 1;
});
