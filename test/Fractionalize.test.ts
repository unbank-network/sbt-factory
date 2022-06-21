import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract, constants } from "ethers";

import { numToWei } from "../utils/ethUnitParser";
import { toBn } from "../utils/bn";

describe("Fractionalize", () => {
  const AddressZero = constants.AddressZero;
  const nftName = "Test NFT";
  const nftSymbol = "tNFT";
  const nftBaseUri = "ipfs://";
  const erc20Name = "Fractionalized NFT";
  const erc20Symbol = "fNFT";

  let admin, user1, user2;
  let fractionalizeI: Contract;
  let nftI: Contract;

  before(async () => {
    [admin, user1, user2] = await ethers.getSigners();
    admin; // lint ignore unused

    const MockERC721 = await ethers.getContractFactory("MockERC721");
    nftI = await MockERC721.deploy(nftName, nftSymbol, nftBaseUri);
    await nftI.deployed();

    const Fractionalize = await ethers.getContractFactory("Fractionalize");
    fractionalizeI = await Fractionalize.deploy(nftI.address);
    await fractionalizeI.deployed();
  });

  it("Should have the base contract deployments", async () => {
    expect(nftI.address).to.exist;
    expect(await nftI.name()).to.equal(nftName);
    expect(await nftI.symbol()).to.equal(nftSymbol);
    expect(await nftI.baseURI()).to.equal(nftBaseUri);

    expect(fractionalizeI.address).to.exist;
    expect(await fractionalizeI.nft()).to.equal(nftI.address);
  });

  it("Should be able to mint NFT", async () => {
    await nftI.mint(user1.address);
    expect(await nftI.balanceOf(user1.address)).to.equal(1);
    expect(await nftI.ownerOf(0)).to.equal(user1.address);
  });

  it("Should be able to fractionalize NFT", async () => {
    const tokenId = 0;
    const erc20Amount = numToWei(1000, 18);

    expect(await nftI.ownerOf(tokenId)).to.equal(user1.address);
    expect(await fractionalizeI.erc20s(tokenId)).to.equal(AddressZero);

    await nftI.connect(user1).approve(fractionalizeI.address, tokenId);
    await fractionalizeI.connect(user1).lockAndMint(tokenId, erc20Amount);

    expect(await nftI.ownerOf(tokenId)).to.not.equal(user1.address);
    expect(await nftI.ownerOf(tokenId)).to.equal(fractionalizeI.address);

    const erc20Fracd = await fractionalizeI.erc20s(tokenId);
    expect(erc20Fracd).to.not.equal(AddressZero);
    const erc20I = await ethers.getContractAt("FractionalizedERC20", erc20Fracd);
    expect(await erc20I.name()).to.equal(erc20Name);
    expect(await erc20I.symbol()).to.equal(erc20Symbol);
    expect(await erc20I.totalSupply()).to.equal(erc20Amount);
    expect(await erc20I.balanceOf(user1.address)).to.equal(erc20Amount);
    expect(await erc20I.balanceOf(fractionalizeI.address)).to.equal(0);
  });

  it("Should perform necessary ERC20 operations but cannot burn", async () => {
    const tokenId = 0;
    const erc20Amount = numToWei(1000, 18);

    const erc20Fracd = await fractionalizeI.erc20s(tokenId);
    const erc20I = await ethers.getContractAt("FractionalizedERC20", erc20Fracd);
    await erc20I.connect(user1).transfer(user2.address, erc20Amount);
    expect(await erc20I.balanceOf(user2.address)).to.equal(erc20Amount);

    await expect(erc20I.connect(user2).transfer(AddressZero, erc20Amount)).to.be.revertedWith(
      "ERC20: transfer to the zero address",
    );
    await expect(erc20I.connect(user2).transfer(AddressZero, 0)).to.be.revertedWith(
      "ERC20: transfer to the zero address",
    );
    await erc20I.connect(user2).transfer(user1.address, erc20Amount);

    expect(await erc20I.owner()).to.equal(fractionalizeI.address);
    await expect(erc20I.connect(user1).burnFrom(user1.address, 0)).to.be.revertedWith(
      "Ownable: caller is not the owner",
    );
  });

  it("Should not be able to redeem NFT with partial erc20 repayment", async () => {
    const tokenId = 0;

    const erc20Fracd = await fractionalizeI.erc20s(tokenId);
    const erc20I = await ethers.getContractAt("FractionalizedERC20", erc20Fracd);
    const totalSupply = await erc20I.totalSupply();
    const halfSupply = toBn(totalSupply).div(2).toFixed();

    // reduce user balance
    await erc20I.connect(user1).transfer(user2.address, halfSupply);

    await erc20I.connect(user1).approve(fractionalizeI.address, totalSupply);
    await expect(fractionalizeI.connect(user1).unlockAndRedeem(tokenId)).to.be.revertedWith(
      "ERC20: burn amount exceeds balance",
    );

    // return user amount
    await erc20I.connect(user2).transfer(user1.address, halfSupply);
  });

  it("Should be able to redeem NFT with full erc20 repayment", async () => {
    const tokenId = 0;

    const erc20Fracd = await fractionalizeI.erc20s(tokenId);
    const erc20I = await ethers.getContractAt("FractionalizedERC20", erc20Fracd);
    const totalSupply = await erc20I.totalSupply();

    await erc20I.connect(user1).approve(fractionalizeI.address, totalSupply);
    await expect(fractionalizeI.connect(user1).unlockAndRedeem(tokenId))
      .to.emit(erc20I, "Transfer")
      .withArgs(user1.address, AddressZero, totalSupply);

    expect(await fractionalizeI.erc20s(tokenId)).to.equal(AddressZero);
    expect(await erc20I.balanceOf(user1.address)).to.equal(0);
    expect(await erc20I.balanceOf(fractionalizeI.address)).to.equal(0);
    expect(await erc20I.totalSupply()).to.equal(0);
    expect(await nftI.ownerOf(tokenId)).to.equal(user1.address);
    expect(await nftI.balanceOf(user1.address)).to.equal(1);
  });
});
