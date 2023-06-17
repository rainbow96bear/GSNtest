import { HardhatUserConfig } from "hardhat/config";
import Config from "./helper-hardhat-config";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-etherscan";

import dotenv from "dotenv";
dotenv.config();

const { ALCHEMY_URL, METAMASK_KEY } = process.env;
const MAINNET_RPC_URL = process.env.ALCHEMY_URL;
const PRIVATE_KEY = METAMASK_KEY;
const config: HardhatUserConfig = {
  ...Config,
};

export default config;
