import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const accounts = (process.env.PRIVATE_KEYS ?? "").split(",");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: process.env.SEPOLIA_RPC,
      accounts: accounts,
    },
    baseSepolia: {
      url: "https://base-sepolia.blockpi.network/v1/rpc/public",
      accounts: accounts,
    },
  },
};

export default config;
