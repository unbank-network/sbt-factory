import "@nomiclabs/hardhat-waffle";
import { HardhatUserConfig } from "hardhat/config";

import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

const config: HardhatUserConfig = {
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
  },
};

export default config;
