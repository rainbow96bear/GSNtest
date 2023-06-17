import { HardhatUserConfig } from "hardhat/types";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.8",
  networks: {
    hardhat: {},
    localhost: {
      chainId: 31337,
    },
  },
};

export default config;
