// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

contract ChainLinkFunctionsCaller is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    // https://docs.chain.link/chainlink-functions/supported-networks
    // Ethereum Sepolia
    address chainLinkFunctionsRouter =
        0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;
    bytes32 chainLinkFunctionsDonID =
        0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;

    uint64 immutable subscriptionId;

    constructor(
        uint64 _subscriptionId
    ) FunctionsClient(chainLinkFunctionsRouter) ConfirmedOwner(msg.sender) {
        subscriptionId = _subscriptionId;
    }

    event SentRequest(
        bytes32 requestId,
        uint64 subscriptionId,
        uint32 gasLimit,
        bytes32 donId
    );
    // 3ed4dc8a6ae289b845dea36685155bbccd02f9a88c430bc1a015878c7ad44d86
    event Fullfilled(bytes32 requestId, bytes response, bytes error);

    uint32 gasLimit = 300000;
    string source =
        "const orgAndRepo = args[0];"
        "const jwt = secrets.jwt;"
        "const res1 = await Functions.makeHttpRequest({"
        "  url: `https://api.github.com/repos/${orgAndRepo}/contributors`"
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
        "      name: `${orgAndRepo}_${new Date().getTime()}.json`"
        "    },"
        "    pinataContent: contributors"
        "  }"
        "});"
        "if (res2.error) {"
        "  throw Error('Request2 failed: ' + JSON.stringify(res2) + JSON.stringify(contributors));"
        "};"
        "return Functions.encodeString(res2.data.IpfsHash);";

    function fundToRepo(
        string memory orgAndName,
        address tokenAddress,
        uint256 amount,
        uint8 donHostedSecretsSlotID,
        uint64 donHostedSecretsVersion
    ) external payable {
        string[] memory args = new string[](1);
        args[0] = orgAndName;
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        req.setArgs(args);
        req.addDONHostedSecrets(
            donHostedSecretsSlotID,
            donHostedSecretsVersion
        );

        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            chainLinkFunctionsDonID
        );

        emit SentRequest(
            requestId,
            subscriptionId,
            gasLimit,
            chainLinkFunctionsDonID
        );
    }

    bytes32 public latestRequestId = 0x0;
    bytes public latestResponse;
    bytes public latestErr;

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        latestRequestId = requestId;
        latestResponse = response;
        latestErr = err;

        emit Fullfilled(requestId, response, err);
    }
}
