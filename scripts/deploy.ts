// import hre from "hardhat";
import { writeFileSync } from "fs";
const { ethers } = require("hardhat");

// const outputFilePath = `./deployments/${hre.network.name}.json`;

async function main() {
  const FenrirIpfsNft = await ethers.getContractFactory("FenrirIpfsNft");
  const nft = await FenrirIpfsNft.deploy();
  await nft.deployed();
  console.log("FenrirIpfsNft deployed to:", nft.address);

  // const Fractionalize = await hre.ethers.getContractFactory("Fractionalize");
  // const fractionalize = await Fractionalize.deploy(nft.address);
  // await fractionalize.deployed();
  // console.log("Fractionalize deployed to:", fractionalize.address);

  // const output = {
  //   FenrirIpfsNft: nft.address,
  //   // Fractionalize: fractionalize.address,
  // };
  // writeFileSync(outputFilePath, JSON.stringify(output, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
