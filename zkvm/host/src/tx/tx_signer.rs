use ethers::abi::AbiEncode;
use ethers::addressbook::Address;
use ethers::core::k256;
use ethers::middleware::SignerMiddleware;
use ethers::prelude::{Http, LocalWallet, PendingTransaction, Provider, TransactionReceipt, TransactionRequest, Wallet};
use ethers::providers::Middleware;
use ethers::signers::Signer;

pub struct TxSender {
    chain_id: u64,
    client: SignerMiddleware<Provider<Http>, Wallet<k256::ecdsa::SigningKey>>,
    contract: Address,
}

impl TxSender {
    pub fn new(
        chain_id: u64,
        rpc_url: &str,
        private_key: &str,
        contract: &str,
    ) -> anyhow::Result<Self> {
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

    pub async fn send(&self, calldata: Vec<u8>) -> anyhow::Result<String> {
        let tx = TransactionRequest::new()
            .chain_id(self.chain_id)
            .to(self.contract)
            .from(self.client.address())
            .data(calldata);

        log::info!("Transaction request: {:?}", &tx);

        let tx = self.client.send_transaction(tx, None).await?;

        Ok(tx.tx_hash().encode_hex())
    }
}
