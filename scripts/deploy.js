const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const FruitMarketplace = await hre.ethers.getContractFactory("FruitMarketplace");
    const fruitMarketplace = await FruitMarketplace.deploy();
    const address = fruitMarketplace.target;
    console.log("FruitMarketplace deployed to:", fruitMarketplace.target);

    // Save address automatically
    const addresses = {
        FruitMarketplace: address,
      };
      fs.writeFileSync(
        path.join(__dirname, "../client/src/utils/contract-address.json"),
        JSON.stringify(addresses, null, 2)
      );

    // Save ABI automatically (for frontend)
    const artifact = await hre.artifacts.readArtifact("FruitMarketplace");
    fs.writeFileSync(
      path.join(__dirname, "../client/src/utils/contract-abi.json"),
      JSON.stringify(artifact.abi, null, 2)
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })

// Deploy with ` npx hardhat run --network base scripts/deploy.js `