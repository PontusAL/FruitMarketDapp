#!/bin/bash

echo "Cleaning..."
npx hardhat clean

echo "Compiling..."
npx hardhat compile

echo "Running tests..."
npx hardhat test

echo "Deploying contract..."
npx hardhat run scripts/deploy.js