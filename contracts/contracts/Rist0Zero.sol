// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "../libs/risc0-ethereum/contracts/src/IRiscZeroVerifier.sol";

contract Risc0Test {
    bytes32 public constant IMAGE_ID = bytes32(0x7e1e473d66daf6500dad4141e4939f1bd9b11e50cd6d984f1bbaaccafc527788);

    IRiscZeroVerifier public immutable verifier;

    constructor(IRiscZeroVerifier _verifier) {
        verifier = _verifier;
    }

    event Verified(uint256 fundId, string[] logins, uint256[] shares);

    function distributes(uint256 fund_id, string[] memory logins, uint256[] memory shares, bytes memory journal, bytes32 postStateDigest, bytes memory seal) external {
        require(verifier.verify(seal, IMAGE_ID, postStateDigest, sha256(journal)));
        emit Verified(fund_id, logins, shares);
    }
}
