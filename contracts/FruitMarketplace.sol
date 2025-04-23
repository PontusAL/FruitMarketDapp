// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FruitMarketplace {

    struct Fruit {
        string name;
        uint256 price;
        address seller;
        bool available;
    }
    Fruit[] public fruits;

    function addFruit(string calldata name, uint256 price) public {
        // Calldata uses less gas than memory, but cannot be modified. 
        require(bytes(name).length > 0, "Name required");
        require(price > 0, "Price must be positive and not 0");

        fruits.push(Fruit({
            name: name,
            price: price,
            seller: msg.sender,
            available: true
            })
        );
    }

    function buyFruit(uint256 index) external payable {
        // External since it shouldn't be able to be called internally (works like public but unables method calling from within)
        // Using list index because I reckon it uses the least amount of computing power and there the least amount of gas.
        require(index < fruits.length, "Invalid fruit index");
        Fruit storage fruit = fruits[index];
        require(fruit.available, "Fruit is not available");
        require(msg.value >= fruit.price, "Insufficient funds");

        fruit.available = false;

        payable(fruit.seller).transfer(fruit.price);
    }

    function setFruitPrice(uint256 index, uint256 newPrice) external {
        require(index < fruits.length, "Invalid fruit index");
        Fruit storage fruit = fruits[index];
        require(fruit.available, "Fruit is not available"); // Makes no sense to update price of an already sold item
        require(msg.sender == fruit.seller, "Not your listing");
        require(newPrice > 0, "Price must be positive and not 0");
        fruit.price = newPrice;
    }

    function getFruits() public view returns (Fruit[] memory){
        // Should this be public ?
        return fruits;
    }
}