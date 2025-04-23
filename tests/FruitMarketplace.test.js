const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FruitMarketplace - Deployment", function () {
    it("should deploy the contract successfully", async function () {
      const Factory = await ethers.getContractFactory("FruitMarketplace");
      const contract = await Factory.deploy();
  
      // Stop forgetting; Ethers v6: use .target instead of .address
      const address = contract.target;
  
      expect(address).to.properAddress; // Basically the same functions as the isValidUUID() I implemented in GLO-3112
      expect(address).to.not.equal("0x0000000000000000000000000000000000000000");
    });
});

describe("FruitMarketplace - adding fruit", function () {

    let contract;
    let seller;

    beforeEach(async () => {
        // test env setup
        seller = await ethers.getSigners();
        const Factory = await ethers.getContractFactory("FruitMarketplace");
        contract = await Factory.deploy();
    });

    it("should add fruit to fruits list", async function () {
        // Given
        await contract.connect(seller).addFruit("Test fruit", ethers.parseEther("1"));

        const fruits = await contract.getBooks();
        // Assertions
        expect(fruits.length).to.equal(1);
        expect(fruits[0].name).to.equal("Test fruit");
        expect(fruits[0].price).to.equal(ethers.parseEther("1"));
        expect(fruits[0].seller).to.equal(seller.address);
        expect(fruits[0].available).to.be.true;
    })

    it("should reject fruits without a name", async function () {
        await expect(
            contract.connect(seller).addFruit("", ethers.parseEther("1"))
          ).to.be.revertedWith("Name required");
    })

    it("should reject fruits without a price", async function () {
        await expect(
            contract.connect(seller).addFruit("Test fruit", 0)
          ).to.be.revertedWith("Price must be positive and not 0");
    })
})

describe("FruitMarketplace - buying fruit", function () {
    let contract;
    let seller, buyer;

    beforeEach(async () => {
        [_, seller, buyer] = await ethers.getSigners();
        const Factory = await ethers.getContractFactory("FruitMarketplace");
        contract = await Factory.deploy();

        await contract.connect(seller).addFruit("Mango", ethers.parseEther("1"));
    });

    it("should allow a buyer to purchase a fruit", async () => {
        await contract.connect(buyer).buyFruit(0, { value: ethers.parseEther("1") });

        const fruits = await contract.getFruits();
        expect(fruits[0].available).to.be.false;
    });

    it("should fail if not enough ETH is sent", async () => {
        await expect(
            contract.connect(buyer).buyFruit(0, { value: ethers.parseEther("0.5") })
        ).to.be.revertedWith("Insufficient funds");
    });

    it("should fail if fruit is already sold", async () => {
        await contract.connect(buyer).buyFruit(0, { value: ethers.parseEther("1") });

        await expect(
            contract.connect(buyer).buyFruit(0, { value: ethers.parseEther("1") })
        ).to.be.revertedWith("Fruit is not available");
    });
});