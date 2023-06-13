import { HardhatUserConfig } from "hardhat/config";
// import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import dotenv from "dotenv";

dotenv.config();

const { ALCHEMY_URL, METAMASK_KEY } = process.env;
const config: HardhatUserConfig = {
  solidity: "0.8.18",
  defaultNetwork: "mumbai",
  networks: {
    hardhat: {},
    mumbai: {
      url: ALCHEMY_URL,
      accounts: [`0x${METAMASK_KEY}`],
    },
  },
};

export default config;
