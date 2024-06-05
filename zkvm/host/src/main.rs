// use axum::{
//     routing::post,
//     Json, Router,
// };

use methods::BIT_BOUNTY_RISC0_GUEST_ELF;
use crate::prover::bonsai::BonsaiProver;
use alloy_primitives::{FixedBytes};
use alloy_sol_types::{sol, SolInterface};
use ethers::prelude::*;
use ethers::utils::hex;
use tokio::task;
use tokio::task::spawn_blocking;

mod prover;

sol! {
    interface IVerifier {
        function verify(bytes calldata seal, bytes32 imageId, bytes32 postStateDigest, bytes32 journalDigest);
    }
}

pub struct TxSender {
    chain_id: u64,
    client: SignerMiddleware<Provider<Http>, Wallet<k256::ecdsa::SigningKey>>,
    contract: Address,
}

impl TxSender {
    pub fn new(chain_id: u64, rpc_url: &str, private_key: &str, contract: &str) -> anyhow::Result<Self> {
        let provider = Provider::<Http>::try_from(rpc_url)?;
        let wallet: LocalWallet = private_key.parse::<LocalWallet>()?.with_chain_id(chain_id);
        let client = SignerMiddleware::new(provider.clone(), wallet.clone());
        let contract = contract.parse::<Address>()?;

        Ok(TxSender {
            chain_id,
            client,
            contract,
        })
    }

    pub async fn send(&self, calldata: Vec<u8>) -> anyhow::Result<Option<TransactionReceipt>> {
        let tx = TransactionRequest::new()
            .chain_id(self.chain_id)
            .to(self.contract)
            .from(self.client.address())
            .data(calldata);

        log::info!("Transaction request: {:?}", &tx);

        let tx = self.client.send_transaction(tx, None).await?.await?;

        log::info!("Transaction receipt: {:?}", &tx);

        Ok(tx)
    }
}

#[tokio::main]
async fn main() {
    // Initialize tracing. In order to view logs, run `RUST_LOG=info cargo run`
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::filter::EnvFilter::from_default_env())
        .init();

    let bonsai = BonsaiProver::new(
        "https://api.bonsai.xyz/".to_string(),
        "X9IttCbiqA10MmfV8Jl8y7QZXSS6LH3laMmGGKCi".to_string(),
    );

    let input = 15 * u32::pow(2, 27);
    let input = bincode::serialize(&input).unwrap();

    println!("calling bonsai, input: {:?}", input);

    let (image_id, journal, post_state_digest, seal) = bonsai.prove(
        BIT_BOUNTY_RISC0_GUEST_ELF,
        &input,
    ).await.expect("TODO: panic message");
    let image_id = {
        let image_id_bytes = hex::decode(image_id).unwrap();
        let mut fixed_array = [0u8; 32];
        fixed_array.copy_from_slice(&image_id_bytes);
        FixedBytes::new(fixed_array)
    };
    let seal = alloy_primitives::Bytes::from(seal);
    let journal_digest = FixedBytes::new(ethers::utils::keccak256(&journal));

    println!("journal: {:?}", journal);
    println!("post_state_digest: {:?}", post_state_digest);
    println!("seal: {:?}", seal);

    let tx_sender = TxSender::new(
        31337,
        "http://127.0.0.1:8545/",
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    ).unwrap();

    let calldata = IVerifier::IVerifierCalls::verify(IVerifier::verifyCall {
        seal,
        imageId: image_id,
        postStateDigest: post_state_digest,
        journalDigest: journal_digest,
    }).abi_encode();

    let result = tx_sender.send(calldata).await.unwrap();
    println!("called result: {:?}", result);

    // let app = Router::new().route("/", post(handler));
    //
    // let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    //
    // axum::serve(listener, app).await.unwrap();

    // prover::prover::prove();
}

// async fn handler() -> Json<String> {
//
//     Json("Hello, World!!!".to_string())
// }
