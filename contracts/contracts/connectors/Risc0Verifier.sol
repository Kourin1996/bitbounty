// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IRiscZeroVerifier {
    function verify(
        bytes calldata seal,
        bytes32 imageId,
        bytes32 journalDigest
    ) external view;
}

contract Risc0Verifier {
    IRiscZeroVerifier public verifier;
    bytes32 public imageId;

    constructor(address _verifier, bytes32 _imageId) {
        verifier = IRiscZeroVerifier(_verifier);
        imageId = _imageId;
    }

    function verifyRisc0Proof(
        bytes calldata seal,
        bytes32 journalDigest
    ) public view {
        verifier.verify(seal, imageId, journalDigest);
    }

    function _updateRisc0Parameters(
        address _verifier,
        bytes32 _imageId
    ) internal {
        verifier = IRiscZeroVerifier(_verifier);
        imageId = _imageId;
    }
}
