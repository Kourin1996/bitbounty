// Copyright 2024 RISC Zero, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// This application demonstrates how to send an off-chain proof request
// to the Bonsai proving service and publish the received proofs directly
// to your deployed app contract.

use alloy_primitives::U256;
use alloy_sol_types::{sol, SolInterface};
use anyhow::Result;
use apps::{BonsaiProver, TxSender};
use methods::IS_EVEN_ELF;
use serde::{Serialize, Deserialize};
use serde_json;

// `IFundManager` interface automatically generated via the alloy `sol!` macro.
sol! {
    interface IFundManager {
        function distributeFund(uint256 fund_id, string[] logins, uint256[] shares, bytes journal, bytes32 postStateDigest, bytes seal);
    }
}

#[derive(Deserialize, Debug)]
struct Config {
    chain_id: u64,
    wallet_private_key: String,
    rpc_url: String,
    contract: String,
}

// static JSON_EXAMPLE: &str = r#"[{"id":573827,"login":"se3000","contributions":2675}]"#;
static JSON_EXAMPLE: &str = r#"{
    "fund_id": 0,
    "value": 1000000000000000000,
    "contributions": [{"id":573827,"login":"se3000","contributions":2675},{"id":344071,"login":"j16r","contributions":2165},{"id":635121,"login":"dimroc","contributions":1581},{"id":680789,"login":"rupurt","contributions":1497},{"id":4147639,"login":"samsondav","contributions":1275},{"id":14809513,"login":"RyanRHall","contributions":1115},{"id":6404866,"login":"HenryNguyen5","contributions":771},{"id":1194128,"login":"jmank88","contributions":749},{"id":70152,"login":"coventry","contributions":613},{"id":6523673,"login":"alexroan","contributions":558},{"id":96362174,"login":"chainchad","contributions":504},{"id":10747945,"login":"thodges-gh","contributions":488},{"id":24452339,"login":"spooktheducks","contributions":462},{"id":27856297,"login":"dependabot-preview[bot]","contributions":447},{"id":71980293,"login":"infiloop2","contributions":427},{"id":5782319,"login":"connorwstein","contributions":373},{"id":61834,"login":"jkongie","contributions":358},{"id":1372918,"login":"archseer","contributions":351},{"id":53467295,"login":"felder-cl","contributions":237},{"id":49699333,"login":"dependabot[bot]","contributions":233},{"id":6235999,"login":"PiotrTrzpil","contributions":227},{"id":53539231,"login":"typescribe","contributions":220},{"id":32734780,"login":"hellobart","contributions":220},{"id":40662484,"login":"NavyAdmiral","contributions":192},{"id":1416262,"login":"bolekk","contributions":189},{"id":4341712,"login":"tyrion70","contributions":159},{"id":18550384,"login":"cedric-cordenier","contributions":155},{"id":10038988,"login":"kalverra","contributions":151},{"id":6530589,"login":"makramkd","contributions":147},{"id":10238396,"login":"tateexon","contributions":143}]
}"#;

#[derive(Debug, Serialize, Deserialize)]
pub struct UserShare {
    pub login: String,
    pub share: u128,
}

fn main() -> Result<()> {
    env_logger::init();

    let config = envy::from_env::<Config>().unwrap();

    println!("env: {:?}", config);

    // Prove
    // Send an off-chain proof request to the Bonsai proving service.
    let (journal, post_state_digest, seal) = BonsaiProver::prove(IS_EVEN_ELF, JSON_EXAMPLE.as_bytes())?;

    println!("journal: {:?}", journal);

    // Decode the journal. Must match what was written in the guest with
    let decoded = std::str::from_utf8(&journal).unwrap();

    println!("decoded: {:?}", decoded);

    let shares: Vec<UserShare> = serde_json::from_str(decoded).unwrap();

    println!("shares: {:?}", shares);

    // Send transaction
    // Encode the function call for `IEvenNumber.set(x)`.
    let calldata = IFundManager::IFundManagerCalls::distributeFund(IFundManager::distributeFundCall {
        fund_id: U256::from(0x0),
        logins: shares.iter().map(|x| x.login.clone()).collect(),
        shares: shares.iter().map(|x| U256::from(x.share)).collect(),
        journal: journal,
        postStateDigest: post_state_digest,
        seal: seal,
    })
    .abi_encode();

    println!("calldata: {:?}", calldata);

    // Create a new `TxSender`.
    let tx_sender = TxSender::new(
        config.chain_id,
        &config.rpc_url,
        &config.wallet_private_key,
        &config.contract,
    )?;

    // Send the calldata to Ethereum.
    let runtime = tokio::runtime::Runtime::new()?;
    let tx_output = runtime.block_on(tx_sender.send(calldata))?;

    println!("tx output: {:?}", tx_output);

    Ok(())
}
