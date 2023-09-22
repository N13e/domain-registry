const hre = require("hardhat");

async function main() {

  const domainRegistry = await hre.ethers.deployContract("DomainRegistry");

  await domainRegistry.waitForDeployment();

  console.log(
    `Contract deployed to ${domainRegistry.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
