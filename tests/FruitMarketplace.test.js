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

describe("FruitMarketplace - adding fruit", function () {

    beforeEach(async () => {
        [owner, seller] = await ethers.getSigners();
        const Factory = await ethers.getContractFactory("BookMarketplace");
        contract = await Factory.deploy();
      });

    it("should add fruit to fruits list", async function () {
        const FruitMarketplace = await ethers.getContractFactory("FruitMarketplace");
        const fruitMarketplace = await FruitMarketplace.deploy();
        const address = fruitMarketplace.target;
        //await fruitMarketplace.deployed(); // I don't understand why this works instead but okay

    })
})