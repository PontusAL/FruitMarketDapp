const hre = require("hardhat");

async function main() {
    const FruitMarketplace = await hre.ethers.getContractFactory("FruitMarketplace");
    const fruitMarketplace = await FruitMarketplace.deploy();
    const address = fruitMarketplace.target;
    console.log("FruitMarketplace deployed to:", fruitMarketplace.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })

// Deploy with ` npx hardhat run --network base scripts/deploy.js `