use crate::tx::tx_signer::TxSender;
use crate::utils::{fetch_json_from_pinata, get_fund_amount_and_ipfs_hash, hash_sha256, to_bytes32, u256_to_u8_vec, verify_bonsai, verify_local, verify_risc0_proof};
use alloy_sol_types::{sol, SolCall, SolInterface};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::{Extension, Json, Router};
use serde::{Deserialize, Serialize};
use sha2::Digest;
use std::sync::Arc;
use ethers::abi::AbiEncode;
use ethers::prelude::U256;
use thiserror::Error;
use tokio::sync::RwLock;
use tokio::task;

mod prover;
mod tx;
mod utils;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ZKVMInput {
    pub fund_id: Vec<u8>,
    pub total: Vec<u8>,
    pub contributions: Vec<Contribution>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Contribution {
    pub login: String,
    pub contributions: u64,
}

sol! {
    interface IFundManager {
        function distributeFund(
            bytes calldata seal,
            bytes32 postStateDigest,
            bytes memory journal
        );
    }
}

fn load_env_value(key: &str) -> String {
    let value = std::env::var(key).expect(&format!("{} must be set.", key));

    println!("Loaded env value: {}={}", key, value.clone());

    value
}

#[tokio::main]
async fn main() {
    // Initialize tracing. In order to view logs, run `RUST_LOG=info cargo run`
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::filter::EnvFilter::from_default_env())
        .init();

    dotenv::dotenv().ok();

    let api_port = load_env_value("API_PORT");
    let ethereum_sepolia_rpc_url = load_env_value("ETHEREUM_SEPOLIA_RPC_URL");
    let signer_private_key = load_env_value("SIGNER_PRIVATE_KEY");
    let pinata_gateway_domain = load_env_value("PINATA_GATEWAY_DOMAIN");
    let pinata_api_key = load_env_value("PINATA_API_KEY");
    let bonsai_url = load_env_value("BONSAI_URL");
    let bonsai_api_key = load_env_value("BONSAI_API_KEY");

    let api_setting = Arc::new(RwLock::new(ApiSetting {
        ethereum_sepolia_rpc_url,
        private_key: signer_private_key,
        pinata_gateway_domein: pinata_gateway_domain,
        pinata_api_key,
        bonsai_url,
        bonsai_api_key,
    }));

    let app = Router::new()
        .route(
            "/prove/distributions",
            post(post_prove_distributions_handler),
        )
        .route(
            "/healthcheck",
            get(|| async { "ok" })
        )
        .layer(Extension(api_setting.clone()));

    let binding = format!("0.0.0.0:{}", api_port);
    let listener = tokio::net::TcpListener::bind(binding.as_str()).await.unwrap();

    println!("Listening on: http://{}", listener.local_addr().unwrap());

    axum::serve(listener, app).await.unwrap();
}

struct ApiSetting {
    ethereum_sepolia_rpc_url: String,
    private_key: String,
    pinata_gateway_domein: String,
    pinata_api_key: String,
    bonsai_url: String,
    bonsai_api_key: String,
}

#[derive(Error, Clone, Debug)]
pub enum ApiError {
    #[error("ipfs hash is not set")]
    EmptyIpfsHash,
}

impl Into<StatusCode> for ApiError {
    fn into(self) -> StatusCode {
        match self {
            ApiError::EmptyIpfsHash => StatusCode::BAD_REQUEST,
        }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let status_code: StatusCode = self.clone().into();
        (status_code, self.to_string()).into_response()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct PostProveDistributionsRequestBody {
    chain_id: String,
    contract_address: String,
    fund_index: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct PostProveDistributionsResponse {
    hash: String,
}

async fn post_prove_distributions_handler(
    Extension(state): Extension<Arc<RwLock<ApiSetting>>>,
    Json(body): Json<PostProveDistributionsRequestBody>,
) -> Result<Json<PostProveDistributionsResponse>, ApiError> {
    println!("body: {:?}", body);

    let (
        ethereum_sepolia_rpc_url,
        private_key,
        pinata_gateway_domain,
        pinata_api_key,
        bonsai_url,
        bonsai_api_key,
    ) = {
        let guard = state.read().await;
        (
            guard.ethereum_sepolia_rpc_url.clone(),
            guard.private_key.clone(),
            guard.pinata_gateway_domein.clone(),
            guard.pinata_api_key.clone(),
            guard.bonsai_url.clone(),
            guard.bonsai_api_key.clone(),
        )
    };

    let (amount, ipfs_hash) = get_fund_amount_and_ipfs_hash(
        ethereum_sepolia_rpc_url.clone(),
        body.contract_address.clone(),
        body.fund_index.clone(),
    )
    .await;

    if ipfs_hash.is_empty() {
        return Err(ApiError::EmptyIpfsHash);
    }

    let contributions =
        fetch_json_from_pinata(pinata_gateway_domain, pinata_api_key, ipfs_hash).await;

    println!("contributions: {:?}", contributions);

    let fund_index: U256 = body.fund_index.parse().unwrap();
    let total = u256_to_u8_vec(amount);
    let contributions = serde_json::from_str(&contributions).unwrap();
    let bonsai_input = ZKVMInput {
        fund_id: fund_index.encode(),
        total,
        contributions,
    };
    let bonsai_input = serde_json::to_string(&bonsai_input).unwrap();

    let (seal, post_state_digest, journal) = task::spawn_blocking(move || {
        verify_bonsai(bonsai_url, bonsai_api_key, bonsai_input.as_bytes())
    })
    .await
    .unwrap();

    // let image_id = hex::decode("816cd61df85c5b854865341a8618e92fd8ee9f57900c2de01fbba606ec46efec").unwrap();
    // let res = verify_risc0_proof(
    //     ethereum_sepolia_rpc_url.clone(),
    //     "0x36Be51Af39A2D430368Ffee8C664C46d2298083D".to_string(),
    //     seal.clone(),
    //     image_id,
    //     post_state_digest.clone(),
    //     hash_sha256(&journal.clone()).to_vec(),
    // ).await;

    let chain_id = u64::from_str_radix(body.chain_id.trim_start_matches("0x"), 16).unwrap();

    let tx_sender = TxSender::new(
        chain_id,
        ethereum_sepolia_rpc_url.as_str(),
        private_key.as_str(),
        body.contract_address.as_str(),
    ).unwrap();

    println!("seal: {:?}", hex::encode(&seal));
    println!("postStateDigest: {:?}", hex::encode(&post_state_digest));
    println!("journal: {:?}", hex::encode(&journal));

    let calldata = IFundManager::IFundManagerCalls::distributeFund(IFundManager::distributeFundCall {
        seal: alloy_primitives::Bytes::from(seal),
        postStateDigest: to_bytes32(&post_state_digest).into(),
        journal: alloy_primitives::Bytes::from(journal),
    })
    .abi_encode();

    let res = tx_sender.send(calldata).await;
    let res = res.unwrap().unwrap();

    let tx_hash = hex::encode(res.transaction_hash.to_fixed_bytes().to_vec());

    Ok(Json(PostProveDistributionsResponse{
        hash: format!("0x{tx_hash}"),
    }))
}
