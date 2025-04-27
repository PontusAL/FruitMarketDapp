# FruitMarketDapp
Smart contract for local execution for test and educational purposes

## Project Overview
FruitMarketDapp is a decentralised application (DApp) for buying and selling fruits using a smart contract deployed locally for educational and test purposes. It consists of a Solidity smart contract and a React-based frontend interface connected via Ethers.js.

Main Features:
- Add fruits for sale with price and availability.
- Purchase fruits directly with ETH (on local Hardhat network).
- Update fruit prices (only by the seller).
- Allow buyers to rate sellers after a purchase.

### Constraints:
You have to use node v 18 for the dependencies with hardhat (?) or something, use:
```sh
nvm use 18
```
to use v.18

### auto clean-compile and run tests with npxverify
when opening the project, run 
```sh
source .devrc
```
to temporarily "install" the suite of commands. This will clean, compile, run tests and deploy (in that order) when entering `npxverify` in the terminal. It is hardcoded in `verify.sh`


### Solidity reminder
If you ever forget what you're doing. [Check this](https://www.youtube.com/watch?v=kdvVwGrV7ec&t=82s)


### Installation and Running

1. Make sure you are using Node.js v18:
```bash
nvm use 18
```

2. Install dependencies:
```bash
npm install
cd client
npm install
```

3. Start the local Hardhat node (terminal 1):
```bash
npx hardhat node
```

4. Deploy the contract (terminal 2):
```bash
npx hardhat run scripts/deploy.js --network localhost
```

5. Start the frontend React app (terminal 3):
```bash
cd client
npm run dev
```

6. Connect your MetaMask wallet to Localhost 8545, Chain ID 31337.


### Frontend

The frontend is built using Vite and React.
- Bootstrap is used for basic styling.
- Ethers.js is used to connect to the smart contract.

Navigate to `client/` and run:
```bash
npm run dev
```
This will host the frontend on http://localhost:5173

### Misc
Remember to set metamask to localhost!