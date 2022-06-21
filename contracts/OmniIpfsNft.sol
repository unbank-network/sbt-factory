// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FenrirIpfsNft is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(string => uint8) public hashes;

    constructor() public ERC721("Fenrir NFT", "fenrirNFT") {
        _setBaseURI("ipfs://");
    }

    function awardItem(
        address recipient,
        string memory hash,
        string memory metadata
    ) public returns (uint256) {
        require(hashes[hash] != 1, "exists");
        hashes[hash] = 1;
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, metadata);
        return newItemId;
    }

    /**
     * @dev See {ERC20-_beforeTokenTransfer}.
     *
     * Requirements:
     *
     * - minted tokens must not cause the total supply to go over the cap.
     */

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        
        if (from != address(0)) { // When minting tokens
            revert("not allowed");
        }
    }
}
