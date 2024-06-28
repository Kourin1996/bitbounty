// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ZKPassProof, ZKPassVerifier} from "./connectors/ZKPassVerifier.sol";
import {ChainLinkFunctionsCaller} from "./connectors/ChainLinkFunctionsCaller.sol";
import {Risc0Verifier} from "./connectors/Risc0Verifier.sol";

contract GitHubFundManager is
    ZKPassVerifier,
    ChainLinkFunctionsCaller,
    Risc0Verifier
{
    struct Fund {
        uint256 index;
        uint256 repositoryIndex;
        address funder;
        address tokenAddress;
        uint256 amount;
        string organization;
        string repository;
        bytes32 chainLinkFunctionRequestId;
        string ipfsHash;
        bool isIpfsHashStored;
        bool isDistributed;
    }

    // GitHub Account
    mapping(bytes32 => address) public githubLoginHashToAddress;

    // GitHub Repository
    uint256 public nextRepositoryIndex = 1;
    mapping(string => mapping(string => uint256)) public repositoryIndicies;

    // Fund
    uint256 public nextFundId = 1;
    mapping(uint256 => Fund) public funds;
    mapping(bytes32 => uint256) public chainLinkFunctionRequestIdToFundIndex;

    // Distributed (GitHub login hash => Repository Index => Token Address => Amount)
    mapping(bytes32 => mapping(uint256 => mapping(address => uint256)))
        public distributedAmounts;

    event GitHubAccountAssociated(address indexed user, string githubLogin);
    event RepositoryAdded(
        uint256 indexed repositoryIndex,
        string githubOrganization,
        string githubRepository
    );
    event TokenFundedToRepository(
        uint256 indexed repositoryIndex,
        uint256 indexed fundIndex,
        address tokenAddress,
        uint256 amount,
        address funder
    );
    event TokenDistributed(
        uint256 indexed repositoryIndex,
        uint256 indexed fundIndex,
        address tokenAddress,
        string[] githubLogins,
        uint256[] amounts
    );
    event TokenWithdrawn(
        uint256 indexed repositoryIndex,
        string githubLogin,
        address tokenAddress,
        uint256 amount,
        address recipient
    );

    constructor(
        address _chainLinkRouter,
        bytes32 _chainLinkDonId,
        uint64 _chainLinkSubscriptionId,
        bytes memory _chainLinkSecretsUrls,
        address _risc0Verifier,
        bytes32 _risc0ImageId
    )
        ChainLinkFunctionsCaller(
            _chainLinkRouter,
            _chainLinkDonId,
            _chainLinkSubscriptionId,
            _chainLinkSecretsUrls
        )
        Risc0Verifier(_risc0Verifier, _risc0ImageId)
    {}

    function isGitHubAccountRegistered(
        string memory githubLogin
    ) public view returns (bool) {
        bytes32 githubPassHash = sha256(abi.encodePacked(githubLogin));

        return githubLoginHashToAddress[githubPassHash] != address(0x0);
    }

    function getFundIpfsHash(
        uint256 fundIndex
    ) public view returns (string memory) {
        return funds[fundIndex].ipfsHash;
    }

    function updateChainLinkFunctionParameters(
        bytes32 _donId,
        uint64 _subscriptionId,
        bytes calldata _secretsUrls
    ) external onlyOwner {
        _updateChainLinkFunctionParameters(
            _donId,
            _subscriptionId,
            _secretsUrls
        );
    }

    function updateRisc0Parameters(
        address _verifier,
        bytes32 _imageId
    ) external onlyOwner {
        _updateRisc0Parameters(_verifier, _imageId);
    }

    function registerGitHubPass(
        string memory gitHubLogin,
        ZKPassProof calldata proof
    ) external {
        require(verifyZKPass(proof), "ZKPass verification failed");

        bytes32 githubPassHash = sha256(abi.encodePacked(gitHubLogin));
        require(githubPassHash == proof.uHash, "GitHub login hash mismatch");
        require(
            githubLoginHashToAddress[githubPassHash] == address(0x0),
            "GitHub account is already registered"
        );

        githubLoginHashToAddress[githubPassHash] = msg.sender;

        emit GitHubAccountAssociated(msg.sender, gitHubLogin);
    }

    function fundRepository(
        string memory organization,
        string memory repository,
        address tokenAddress,
        uint256 amount
    ) external payable {
        withdrawERC20Token(msg.sender, tokenAddress, amount);

        uint256 repositoryIndex = repositoryIndicies[organization][repository];
        if (repositoryIndex == 0) {
            repositoryIndex = nextRepositoryIndex;
            nextRepositoryIndex += 1;

            repositoryIndicies[organization][repository] = repositoryIndex;

            emit RepositoryAdded(repositoryIndex, organization, repository);
        }

        bytes32 chainLinkFunctionRequestId = sendFetchContributionsRequest(
            organization,
            repository
        );

        uint256 fundIndex = nextFundId;
        nextFundId += 1;

        funds[fundIndex] = Fund({
            index: fundIndex,
            repositoryIndex: repositoryIndex,
            funder: msg.sender,
            tokenAddress: tokenAddress,
            amount: amount,
            organization: organization,
            repository: repository,
            chainLinkFunctionRequestId: chainLinkFunctionRequestId,
            ipfsHash: "",
            isIpfsHashStored: false,
            isDistributed: false
        });
        chainLinkFunctionRequestIdToFundIndex[
            chainLinkFunctionRequestId
        ] = fundIndex;

        emit TokenFundedToRepository(
            repositoryIndex,
            fundIndex,
            tokenAddress,
            amount,
            msg.sender
        );
    }

    function distributeFund(
        bytes calldata seal,
        bytes32 postStateDigest,
        bytes calldata journal
    ) external {
        (
            uint256 fundId,
            string[] memory githubLogins,
            uint256[] memory amounts
        ) = abi.decode(journal, (uint256, string[], uint256[]));

        require(githubLogins.length == amounts.length, "length mismatch");

        Fund storage fund = funds[fundId];
        require(fund.index != 0, "Fund not found");
        require(!fund.isDistributed, "Fund already distributed");
        require(fund.isIpfsHashStored, "IPFS hash is empty");

        verifyRisc0Proof(seal, sha256(journal));

        uint256 totalAmounts = 0;
        for (uint256 i = 0; i < githubLogins.length; i++) {
            bytes32 githubLoginHash = sha256(abi.encodePacked(githubLogins[i]));

            distributedAmounts[githubLoginHash][fund.repositoryIndex][
                fund.tokenAddress
            ] += amounts[i];
            totalAmounts += amounts[i];
        }

        require(totalAmounts == fund.amount, "total amount mismatch");

        fund.isDistributed = true;

        emit TokenDistributed(
            fund.repositoryIndex,
            fund.index,
            fund.tokenAddress,
            githubLogins,
            amounts
        );
    }

    function withdrawFund(
        uint256 repositoryIndex,
        string memory githubLogin,
        address tokenAddress,
        uint256 amount,
        address recipient
    ) external {
        bytes32 githubLoginHash = sha256(abi.encodePacked(githubLogin));
        require(
            githubLoginHashToAddress[githubLoginHash] == msg.sender,
            "GitHub login mismatch"
        );

        uint256 withdrawable = distributedAmounts[githubLoginHash][
            repositoryIndex
        ][tokenAddress];

        require(withdrawable > 0, "No fund to withdraw");
        require(withdrawable >= amount, "amount is wrong");

        distributedAmounts[githubLoginHash][repositoryIndex][
            tokenAddress
        ] -= amount;

        IERC20 token = IERC20(tokenAddress);
        token.transfer(recipient, amount);

        emit TokenWithdrawn(
            repositoryIndex,
            githubLogin,
            tokenAddress,
            amount,
            recipient
        );
    }

    function withdrawERC20Token(
        address from,
        address tokenAddress,
        uint256 amount
    ) private {
        if (tokenAddress == address(0x0)) {
            require(amount == msg.value, "amount is wrong");
        } else {
            IERC20 token = IERC20(tokenAddress);
            require(
                token.allowance(from, address(this)) >= amount,
                "allowance is not enough"
            );

            token.transferFrom(from, address(this), amount);
        }
    }

    function _onChainLinkFunctionFullfilled(
        bytes32 requestId,
        bytes memory response,
        bytes memory _err
    ) internal override {
        uint256 fundIndex = chainLinkFunctionRequestIdToFundIndex[requestId];
        require(fundIndex != 0, "Fund not found");

        Fund storage fund = funds[fundIndex];
        fund.ipfsHash = string(response);
        fund.isIpfsHashStored = true;
    }
}
