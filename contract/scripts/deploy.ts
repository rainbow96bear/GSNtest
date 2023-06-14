import { ethers } from "hardhat";

async function main() {
  const paymaster = await ethers.getContractFactory("testContract");
  // console.log(paymaster);
  const token = "0xA3419F30F02aE34A1E377D2829dfdCE35F08c76c";
  const paymasterContract = await paymaster.deploy();
  console.log(paymasterContract);
  const Contract = await paymasterContract.deployed();
  console.log("deployed to : ", Contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
