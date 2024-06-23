use crate::prover::bonsai::BonsaiProver;
use ethers::addressbook::Address;
use ethers::contract::abigen;
use ethers::prelude::{Http, Provider, U256};
use methods::BIT_BOUNTY_RISC0_GUEST_ELF;
use risc0_zkvm::serde::to_vec;
use risc0_zkvm::{default_prover, ExecutorEnv, ProverOpts, VerifierContext};
use sha2::{Digest, Sha256};
use std::sync::Arc;
use ethers::types::Bytes;
use risc0_ethereum_contracts::groth16;

pub(crate) fn hash_sha256(data: &[u8]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(data);

    let result = hasher.finalize();
    let mut hash = [0u8; 32];
    hash.copy_from_slice(&result);

    hash
}

pub(crate) fn to_bytes32(data: &[u8]) -> [u8; 32] {
    let mut bytes32 = [0u8; 32];
    bytes32.copy_from_slice(data);

    bytes32
}

pub(crate) fn u256_to_u8_vec(data: U256) -> Vec<u8> {
    let mut bytes = vec![0u8; 32];
    data.to_big_endian(&mut bytes);
    bytes
}

pub(crate) async fn get_fund_amount_and_ipfs_hash(
    rpc_url: String,
    contract_address: String,
    fund_index: String,
) -> (U256, String) {
    abigen!(
        IFundManager,
        r#"[
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "funds",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "index",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "repositoryIndex",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "funder",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "tokenAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "organization",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "repository",
                  "type": "string"
                },
                {
                  "internalType": "bytes32",
                  "name": "chainLinkFunctionRequestId",
                  "type": "bytes32"
                },
                {
                  "internalType": "string",
                  "name": "ipfsHash",
                  "type": "string"
                },
                {
                  "internalType": "bool",
                  "name": "isIpfsHashStored",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "isDistributed",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
        ]"#,
    );

    let provider = Provider::<Http>::try_from(rpc_url).unwrap();
    let client = Arc::new(provider);
    let address: Address = contract_address.parse().unwrap();
    let contract = IFundManager::new(address, client);

    let fund_index: U256 = fund_index.parse().unwrap();

    let res = contract.funds(fund_index).call().await.unwrap();

    let amount = res.4;
    let ipfs_hash = res.8;

    (amount, ipfs_hash)
}

pub(crate) async fn verify_risc0_proof(
    rpc_url: String,
    contract_address: String,
    seal: Vec<u8>,
    image_id: Vec<u8>,
    post_state_digest: Vec<u8>,
    journal_digest: Vec<u8>,
) -> bool {
    // function verify(bytes calldata seal, bytes32 imageId, bytes32 journalDigest) external view
    abigen!(
        IRisc0Verifier,
        r#"[
            {
              "inputs": [
                {
                  "internalType": "bytes",
                  "name": "seal",
                  "type": "bytes"
                },
                {
                  "internalType": "bytes32",
                  "name": "imageId",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32",
                  "name": "journalDigest",
                  "type": "bytes32"
                }
              ],
              "name": "verify",
              "outputs": [],
              "stateMutability": "view",
              "type": "function"
            }
        ]"#,
    );

    let provider = Provider::<Http>::try_from(rpc_url).unwrap();
    let client = Arc::new(provider);
    let address: Address = contract_address.parse().unwrap();
    let contract = IRisc0Verifier::new(address, client);

    println!("seal: {:?}", hex::encode(&seal));
    println!("image_id: {:?}", hex::encode(&image_id));
    println!("journal_digest: {:?}", hex::encode(&journal_digest));

    let res = contract.verify(
        Bytes::from(seal),
        to_bytes32(&image_id),
        to_bytes32(&journal_digest),
    ).call().await.unwrap();

    println!("verify_risc0_proof: {:?}", res);

    true
}

pub(crate) async fn fetch_json_from_pinata(
    pinata_gateway_domain: String,
    pinata_api_key: String,
    ipfs_hash: String,
) -> String {
    let url = format!("https://{pinata_gateway_domain}/ipfs/{ipfs_hash}");
    println!("fetching from pinata: {:?}", url);

    let client = reqwest::Client::new();
    let res = client
        .get(url)
        .header("x-pinata-gateway-token", pinata_api_key)
        .send()
        .await
        .unwrap();

    res.text().await.unwrap()
}

pub(crate) fn verify_local(input: &[u8]) -> (Vec<u8>, Vec<u8>) {
    let env = ExecutorEnv::builder().write(&input).unwrap().build().unwrap();

    let receipt = default_prover()
        .prove_with_ctx(
            env,
            &VerifierContext::default(),
            BIT_BOUNTY_RISC0_GUEST_ELF,
            &ProverOpts::groth16(),
        )
        .unwrap()
        .receipt;

    println!("receipt: {:?}", receipt.inner);

    // Encode the seal with the selector.
    let seal = groth16::encode(receipt.inner.groth16().unwrap().seal.clone()).unwrap();

    // Extract the journal from the receipt.
    let journal = receipt.journal.bytes.clone();

    // let env = ExecutorEnv::builder()
    //     .write(&input)
    //     .unwrap()
    //     .build()
    //     .unwrap();
    //
    // let prover = default_prover();
    // let receipt = prover.prove(env, BIT_BOUNTY_RISC0_GUEST_ELF).unwrap();
    //
    // println!("receipt: {:?}", receipt.receipt);

    (seal, journal)
}

pub(crate) fn verify_bonsai(
    bonsai_url: String,
    bonsai_api_key: String,
    input: &[u8],
) -> (Vec<u8>, Vec<u8>, Vec<u8>) {
    println!(
        "calling bonsai, input: {:?}",
        alloy_primitives::hex::encode(input)
    );

    let bonsai = BonsaiProver::new(bonsai_url, bonsai_api_key);

    let input = to_vec(&input).unwrap();
    let input = bytemuck::cast_slice(&input).to_vec();

    let (image_id, journal, post_state_digest, seal) = bonsai
        .prove(BIT_BOUNTY_RISC0_GUEST_ELF, input.to_vec())
        .expect("TODO: panic message");

    println!("image_id: {:?}", image_id);

    return (seal, post_state_digest, journal);
}
