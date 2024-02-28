// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

contract GitHubFundManager is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    // https://docs.chain.link/chainlink-functions/supported-networks
    address chainLinkFunctionsRouter = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;
    bytes32 chainLinkFunctionsDonID = 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;

    uint64 subscriptionId;

    constructor(uint64 _subscriptionId) FunctionsClient(chainLinkFunctionsRouter) ConfirmedOwner(msg.sender) {
        subscriptionId = _subscriptionId;
    }

    uint32 gasLimit = 300000;
    string source =
        "const orgAndRepo = args[0];"
        "const res1 = await Functions.makeHttpRequest({"
        "url: `https://api.github.com/repos/${orgAndRepo}/contributors`"
        "});"
        "if (res1.error) {"
        "throw Error('Request failed: ' + JSON.stringify(res1));"
        "};"
        "const { data } = res1;"
        "const contributors = data.map((x) => ({id: x.id, login: x.login, contributions: x.contributions}));"
        "const res2 = await Functions.makeHttpRequest({"
        "url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',"
        "method: 'POST',"
        "headers: {"
        "'Accept': 'application/json',"
        "'Content-Type': 'application/json',"
        "'Authorization': 'Bearer xxx'"
        "},"
        "data: {pinataContent: contributors}"
        "});"
        "if (res2.error) {"
        "throw Error('Request failed: ' + JSON.stringify(res2) + JSON.stringify(contributors));"
        "};"
        "return Functions.encodeString(res2.data.IpfsHash);";


    event Response(bytes32 indexed requestId, bytes response, bytes err);

    function sendRequest(string[] memory args) external onlyOwner returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        if (args.length > 0) req.setArgs(args);

        requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            chainLinkFunctionsDonID
        );
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        emit Response(requestId, response, err);
    }
}