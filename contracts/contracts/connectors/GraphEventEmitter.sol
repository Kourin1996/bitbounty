// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GraphEventEmitter {
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
    event TokenDistributedToAccount(
        uint256 indexed repositoryIndex,
        uint256 indexed fundIndex,
        string githubLogin,
        address tokenAddress,
        uint256 amount
    );
    event TokenWithdrawnFromRepository(
        uint256 indexed repositoryIndex,
        string githubLogin,
        address tokenAddress,
        uint256 amount,
        address recipient
    );

    uint256 public nextRepositoryIndex = 1;
    mapping(bytes32 => uint256) repositoryHashToIndex;
    mapping(uint256 => uint256) repositoryIndexToNextFundIndex;

    function emitGitHubAccountAssociated(
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

        uint256 fundIndex = repositoryIndexToNextFundIndex[repositoryIndex] + 1;
        repositoryIndexToNextFundIndex[repositoryIndex] += 1;

        emit TokenFundedToRepository(
            repositoryIndex,
            fundIndex,
            tokenAddress,
            amount,
            msg.sender
        );
    }

    function distributeFundToAccount(
        uint256 repositoryIndex,
        uint256 fundIndex,
        string memory githubLogin,
        address tokenAddress,
        uint256 amount
    ) external {
        emit TokenDistributedToAccount(
            repositoryIndex,
            fundIndex,
            githubLogin,
            tokenAddress,
            amount
        );
    }

    function withdrawToken(
        uint256 repositoryIndex,
        string memory githubLogin,
        address tokenAddress,
        uint256 amount,
        address recipient
    ) external {
        emit TokenWithdrawnFromRepository(
            repositoryIndex,
            githubLogin,
            tokenAddress,
            amount,
            recipient
        );
    }
}
