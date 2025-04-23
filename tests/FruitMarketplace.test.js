const { expect } = require("chai");
const { ethers } = require("hardhat");

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