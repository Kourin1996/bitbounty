// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GraphEventEmitter {
    constructor() {}

    event GitHubAccountAssociated(address indexed user, string githubLogin);
    event RepositoryAdded(
        uint256 repositoryIndex,
        string githubOrganization,
        string githubRepository
    );
    event TokenFundedToRepository(
        uint256 repositoryIndex,
        address tokenAddress,
        uint256 amount
    );
    event TokenWithdrawnFromRepository(
        string githubOrganization,
        string githubRepository,
        address tokenAddress,
        uint256 amount
    );

    uint256 public nextRepositoryIndex = 1;
    mapping(bytes32 => uint256) repositoryHashToIndex;

    function associateGitHubAccount(
        address user,
        string calldata githubLogin
    ) external {
        emit GitHubAccountAssociated(user, githubLogin);
    }

    function fundTokenToRepository(
        string calldata githubOrganization,
        string calldata githubRepository,
        address tokenAddress,
        uint256 amount
    ) external {
        bytes32 repositoryHash = keccak256(
            abi.encodePacked(githubOrganization, githubRepository)
        );

        uint256 repositoryIndex = repositoryHashToIndex[repositoryHash];
        if (repositoryIndex == 0) {
            repositoryHashToIndex[repositoryHash] = nextRepositoryIndex;
            repositoryIndex = nextRepositoryIndex;

            nextRepositoryIndex++;

            emit RepositoryAdded(
                repositoryIndex,
                githubOrganization,
                githubRepository
            );
        }

        emit TokenFundedToRepository(repositoryIndex, tokenAddress, amount);
    }

    function withdrawToken(
        string calldata githubOrganization,
        string calldata githubRepository,
        address tokenAddress,
        uint256 amount
    ) external {
        emit TokenWithdrawnFromRepository(
            githubOrganization,
            githubRepository,
            tokenAddress,
            amount
        );
    }
}
