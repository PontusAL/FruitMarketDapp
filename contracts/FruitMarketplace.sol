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
        require(price > 0, "Price must be positive");

        fruits.push(Fruit({
            name: name,
            price: price,
            seller: msg.sender,
            available: true
            })
        );
    }

    function getFruits() public view returns (Fruit[] memory){
        // Should this be public ?
        return fruits;
    }
}