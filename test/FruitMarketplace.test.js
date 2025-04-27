const { expect } = require("chai");
const { ethers } = require("hardhat");
const nullAddress = "x0000000000000000000000000000000000000000";

describe("FruitMarketplace - Deployment", function () {
    it("should deploy the contract successfully", async function () {
      const Factory = await ethers.getContractFactory("FruitMarketplace");
      const contract = await Factory.deploy();
  
      // Ethers v6 uses .target instead of .address for deployed contracts.
      const address = contract.target;
  
      expect(address).to.properAddress; // Basically the same functions as the isValidUUID() I implemented in GLO-3112
      expect(address).to.not.equal(nullAddress);
    });
});

describe("FruitMarketplace - adding fruit", function () {
    // Test 2
    let contract;
    let seller;

    beforeEach(async () => {
        // test env setup
        [seller] = await ethers.getSigners();
        const Factory = await ethers.getContractFactory("FruitMarketplace");
        contract = await Factory.deploy();
    });

    it("should add fruit to fruits list", async function () {
        // Given
        await contract.connect(seller).addFruit("Test fruit", ethers.parseEther("1"));

        const fruits = await contract.getFruits();
        // Assertions
        expect(fruits.length).to.equal(1);
        expect(fruits[0].name).to.equal("Test fruit");
        expect(fruits[0].price).to.equal(ethers.parseEther("1"));
        expect(fruits[0].seller).to.equal(seller.address);
        expect(fruits[0].buyer).to.not.equal(nullAddress);
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
    // Test 3, 4 and 7 (Grouped because they're so connected/similar)
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
        expect(fruits[0].buyer).to.equal(buyer);
    });

    it("should fail if not enough ETH is sent", async () => {
        await expect(
            contract.connect(buyer).buyFruit(0, { value: ethers.parseEther("0.5") })
        ).to.be.revertedWith("Insufficient funds");

        // Verify that fruit remains available after failed purchase attempt.
        const fruits = await contract.getFruits();
        expect(fruits[0].buyer).to.not.equal(nullAddress);
    });

    it("should fail if fruit is already sold", async () => {
        await contract.connect(buyer).buyFruit(0, { value: ethers.parseEther("1") });

        await expect(
            contract.connect(buyer).buyFruit(0, { value: ethers.parseEther("1") })
        ).to.be.revertedWith("Fruit is not available");
    });
});

describe("FruitMarketplace - updating fruit price", function () {
    // Test 6 
    let contract;
    let seller, rando;

    beforeEach(async () => {
        [_, seller, rando] = await ethers.getSigners();
        const Factory = await ethers.getContractFactory("FruitMarketplace");
        contract = await Factory.deploy();

        await contract.connect(seller).addFruit("Mango", ethers.parseEther("1"));
    });

    it("should allow a seller to update the price of a fruit", async () => {
        await contract.connect(seller).setFruitPrice(0, ethers.parseEther("2"));

        const fruits = await contract.getFruits();
        expect(fruits[0].price).to.equal(ethers.parseEther("2"));
    });

    it("should fail if fruit is already sold", async () => {
        await contract.connect(rando).buyFruit(0, { value: ethers.parseEther("1") });

        await expect(
            contract.connect(seller).setFruitPrice(0, ethers.parseEther("5"))
        ).to.be.revertedWith("Fruit is not available");
    });

    it("should fail if not seller", async () => {
        await expect(
            contract.connect(rando).setFruitPrice(0, ethers.parseEther("5"))
        ).to.be.revertedWith("Not your listing");
    });

    it("should not allow to remove price", async function () {
        await expect(
            contract.connect(seller).setFruitPrice(0, 0)
          ).to.be.revertedWith("Price must be positive and not 0");
    })
});

describe("FruitMarketplace - rating suppliers of fruit", function () {
    // Test 5
    let contract;
    let seller, buyer, rando;

    beforeEach(async () => {
        [_, seller, buyer, rando] = await ethers.getSigners();
        const Factory = await ethers.getContractFactory("FruitMarketplace");
        contract = await Factory.deploy();

        await contract.connect(seller).addFruit("Hallon", ethers.parseEther("1"));
        await contract.connect(buyer).buyFruit(0, { value: ethers.parseEther("1") });
    });

    it("should allow a buyer to rate the seller", async () => {
        await contract.connect(buyer).rateSeller(0, 4);

        const total = await contract.ratingTotal(seller.address);
        const count = await contract.ratingCount(seller.address);

        expect(total).to.equal(4);
        expect(count).to.equal(1);
    });

    it("should not allow rating if not the buyer", async () => {
        await expect(
            contract.connect(rando).rateSeller(0, 5)
        ).to.be.revertedWith("Not eligible to rate this item");
    });

    it("should not allow rating more than once", async () => {
        await contract.connect(buyer).rateSeller(0, 5);

        await expect(
            contract.connect(buyer).rateSeller(0, 4)
        ).to.be.revertedWith("Not eligible to rate this item");
    });

    it("should reject invalid ratings", async () => {
        await expect(
            contract.connect(buyer).rateSeller(0, 0)
        ).to.be.revertedWith("Rating must be between 1 and 5");

        await expect(
            contract.connect(buyer).rateSeller(0, 6)
        ).to.be.revertedWith("Rating must be between 1 and 5");
    });

    it("should return the correct average rating", async () => {
        // Setup second fruit and purchase
        await contract.connect(seller).addFruit("Melon", ethers.parseEther("1"));
        await contract.connect(rando).buyFruit(1, { value: ethers.parseEther("1") });

        await contract.connect(buyer).rateSeller(0, 4);
        await contract.connect(rando).rateSeller(1, 5);

        const avg = await contract.getAverageRating(seller.address);
        expect(avg).to.equal(4); // (4 + 5) / 2 → Solidity rounds down
    });
});