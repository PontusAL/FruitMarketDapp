// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FruitMarketplace {

    struct Fruit {
        string name;
        uint256 price;
        address seller;
        address buyer;
    }
    Fruit[] public fruits;

    mapping(address => uint256) public ratingTotal;
    mapping(address => uint256) public ratingCount;
    mapping(address => mapping(uint256 => bool)) public hasRated;

    event FruitPriceUpdated(uint256 indexed index, uint256 newPrice); // Emit event to frontend

    function addFruit(string calldata name, uint256 price) public {
        // Calldata uses less gas than memory, but cannot be modified. 
        require(bytes(name).length > 0, "Name required");
        require(price > 0, "Price must be positive and not 0");

        fruits.push(Fruit({
            name: name,
            price: price,
            seller: msg.sender,
            buyer: address(0) // Setting to null (also, if null, it's for sale)
            })
        );
    }

    function buyFruit(uint256 index) external payable {
        // External since it shouldn't be able to be called internally (works like public but unables method calling from within)
        // Using list index because I reckon it uses the least amount of computing power and there the least amount of gas.
        require(index < fruits.length, "Invalid fruit index");
        Fruit storage fruit = fruits[index];
        require(fruit.buyer == address(0), "Fruit is not available");
        require(msg.value >= fruit.price, "Insufficient funds");

        fruit.buyer = msg.sender;

        payable(fruit.seller).transfer(fruit.price);
    }

    function setFruitPrice(uint256 index, uint256 newPrice) external {
        require(index < fruits.length, "Invalid fruit index");
        Fruit storage fruit = fruits[index];
        require(fruit.buyer == address(0), "Fruit is not available"); // Makes no sense to update price of an already sold item
        require(msg.sender == fruit.seller, "Not your listing");
        require(newPrice > 0, "Price must be positive and not 0");
        fruit.price = newPrice;
        emit FruitPriceUpdated(index, newPrice); // Emit event to frontend for handling
    }

    function rateSeller(uint256 index, uint8 grade) external {
        require(_canRate(index), "Not eligible to rate this item");
        require(grade >= 1 && grade <= 5, "Rating must be between 1 and 5");

        address seller = fruits[index].seller;
        ratingTotal[seller] += grade;
        ratingCount[seller] += 1;
        hasRated[msg.sender][index] = true;
    }

    function getAverageRating(address seller) public view returns (uint256) {
        // Rounds down to closest integer though
        if (ratingCount[seller] == 0) return 0;
        return ratingTotal[seller] / ratingCount[seller];
    }

    function getFruits() public view returns (Fruit[] memory){
        return fruits;
    }

    function _canRate(uint256 index) private view returns (bool) {
        // Helper for rating requirement
        require(index < fruits.length, "Invalid fruit index");
        Fruit memory fruit = fruits[index];
        return (msg.sender == fruit.buyer && hasRated[msg.sender][index] == false);
    }
}