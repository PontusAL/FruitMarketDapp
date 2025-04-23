const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FruitMarketplace - Hello World Test", function () {
    it("should return hello message", async function () {
        const FruitMarketplace = await ethers.getContractFactory("FruitMarketplace");
        const fruitMarketplace = await FruitMarketplace.deploy();
        await fruitMarketplace.deployed();

        const message = await fruitMarketplace.helloWorld();
        expect(message).to.equal("Hello, Fruit Market!");
    });
});