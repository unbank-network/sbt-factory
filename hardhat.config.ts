require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

module.exports = {
  solidity: "0.6.12",
  networks: {
    bsc: {
      url: process.env.bscRpc || "https://bsc-dataseed.binance.org/",
      accounts: [process.env["PRIVATE_KEY"]],
    },
    kcc: {
      url: process.env.kccRpc || "https://rpc-mainnet.kcc.network",
      accounts: [process.env["PRIVATE_KEY"]],
    },
    kcctest: {
      url: process.env.bscRpc || "https://rpc-testnet.kcc.network",
      accounts: [process.env["PRIVATE_KEY"]],
    },
    mumbai: {
      url: process.env.TEST_ALCHEMY_KEY,
      accounts: [process.env.TEST_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY,
  },
};
