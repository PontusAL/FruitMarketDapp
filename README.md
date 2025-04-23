# FruitMarketDapp
Smart contract for local execution for test and educational purposes


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