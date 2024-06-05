#![no_main]
// If you want to try std support, also update the guest Cargo.toml file
#![no_std]  // std support is experimental

use risc0_zkvm::guest::env;

risc0_zkvm::guest::entry!(main);

fn main() {
    // read the input
    let input: u32 = env::read();

    // TODO: do something with the input
    assert!(input % 2 == 0, "number is not even");

    // TODO: commit abi encoded values

    // write public output to the journal
    env::commit(&input);
}
