use risc0_zkvm::guest::env;
use alloy_sol_types::{sol, SolCall};
use alloy_primitives::{U256};
use serde::{Deserialize, Serialize};

risc0_zkvm::guest::entry!(main);

#[derive(Serialize, Deserialize, Debug)]
pub struct ZKVMInput {
    pub fund_id: Vec<u8>,
    pub total: Vec<u8>,
    pub contributions: Vec<Contribution>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Contribution {
    pub login: String,
    pub contributions: u64,
}

sol!{
    function journal(uint256 fundId, string[] users, uint256[] shares) external view;
}

fn calculate_shares(
    input: ZKVMInput,
) -> Vec<u8> {
    let fund_index = U256::from_be_slice(input.fund_id.as_slice());
    let total = U256::from_be_slice(input.total.as_slice());
    let mut rest = U256::from_be_slice(input.total.as_slice());

    // calculate shares
    let mut shares = {
        let total = total.clone();
        let total_contributions = input.contributions.iter().map(|c| U256::from(c.contributions)).sum::<U256>();

        input.contributions.iter().enumerate().map(|(i, c)| {
            let upper = total * U256::from(c.contributions);
            let share = upper / total_contributions;
            let remaining = upper % share;

            rest -= share;

            (remaining, i, share)
        }).collect::<Vec<_>>()
    };

    // sort by remaining (descending)
    shares.sort_by(|a, b| b.0.cmp(&a.0));

    // distribute the rest
    let mut shares = shares.iter().enumerate().map(|(i, (_, j, s))| {
        (
            j,
            if U256::from(i) < rest {
                s + U256::from(1)
            } else {
                *s
            }
        )
    }).collect::<Vec<_>>();

    // sort by original index
    shares.sort_by(|a, b| a.0.cmp(&b.0));

    let logins = input.contributions.iter().map(|c| c.login.clone()).collect::<Vec<_>>();
    let contributions = shares.iter().map(|(_, s)| *s).collect::<Vec<_>>();

    let params = journalCall {
        fundId: fund_index,
        users: logins,
        shares: contributions,
    };
    let encoded = params.abi_encode();

    encoded[4..].to_vec()
}

fn main() {
    // read the input
    let input: Vec<u8> = env::read();
    let input = serde_json::from_slice::<ZKVMInput>(&input).unwrap();

    let result = calculate_shares(input);

    env::commit_slice(&result);
}
