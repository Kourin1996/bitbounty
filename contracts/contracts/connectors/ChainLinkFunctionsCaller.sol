// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

contract ChainLinkFunctionsCaller is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    // https://docs.chain.link/chainlink-functions/supported-networks
    // Ethereum Sepolia
    // address chainLinkFunctionsRouter =
    //     0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;
    // bytes32 chainLinkFunctionsDonID =
    //     0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;

    uint32 gasLimit = 300000;
    string constant source =
        "const organization = args[0];"
        "const repository = args[1];"
        "const jwt = secrets.jwt;"
        ""
        "const res1 = await Functions.makeHttpRequest({"
        "  url: `https://api.github.com/repos/${organization}/${repository}/contributors`"
        "});"
        "if (res1.error) {"
        "  throw Error('Request1 failed: ' + JSON.stringify(res1));"
        "};"
        "const { data } = res1;"
        "const contributors = data.map((x) => ({login: x.login, contributions: x.contributions}));"
        ""
        "const res2 = await Functions.makeHttpRequest({"
        "  url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',"
        "  method: 'POST',"
        "  headers: {"
        "    'Content-Type': 'application/json',"
        "    'Authorization': `Bearer ${jwt}`"
        "  },"
        "  data: {"
        "    pinataMetadata: {"
        "      name: `${organization}_${repository}_${new Date().getTime()}.json`"
        "    },"
        "    pinataContent: contributors"
        "  }"
        "});"
        "if (res2.error) {"
        "  throw Error('Request2 failed: ' + JSON.stringify(res2) + JSON.stringify(contributors));"
        "};"
        "return Functions.encodeString(res2.data.IpfsHash);";

    bytes32 donId;
    uint64 subscriptionId;
    bytes secretsUrls;

    event ChainLinkFunctionRequested(
        bytes32 requestId,
        uint64 subscriptionId,
        uint32 gasLimit,
        string organization,
        string repository
    );
    event ChainLinkFunctionFullfilled(
        bytes32 requestId,
        bytes response,
        bytes error
    );

    constructor(
        address _router,
        bytes32 _donId,
        uint64 _subscriptionId,
        bytes memory _secretsUrl
    ) FunctionsClient(_router) ConfirmedOwner(msg.sender) {
        donId = _donId;
        subscriptionId = _subscriptionId;
        secretsUrls = _secretsUrl;
    }

    function sendFetchContributionsRequest(
        string memory organization,
        string memory repository
    ) internal returns (bytes32) {
        string[] memory args = new string[](2);
        args[0] = organization;
        args[1] = repository;
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        req.setArgs(args);
        req.addSecretsReference(secretsUrls);

        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donId
        );

        emit ChainLinkFunctionRequested(
            requestId,
            subscriptionId,
            gasLimit,
            organization,
            repository
        );

        return requestId;
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        emit ChainLinkFunctionFullfilled(requestId, response, err);

        _onChainLinkFunctionFullfilled(requestId, response, err);
    }

    function _onChainLinkFunctionFullfilled(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal virtual {}

    function _updateChainLinkFunctionParameters(
        bytes32 _donId,
        uint64 _subscriptionId,
        bytes memory _secretsUrls
    ) internal {
        donId = _donId;
        subscriptionId = _subscriptionId;
        secretsUrls = _secretsUrls;
    }
}
