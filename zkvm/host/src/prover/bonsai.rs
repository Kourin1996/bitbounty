use std::sync::Arc;
use std::thread::sleep;
use std::time::Duration;

use alloy_primitives::FixedBytes;
use anyhow;
use anyhow::Context;
use bonsai_sdk;
use bonsai_sdk::alpha::responses::SnarkReceipt;
use bonsai_sdk::alpha::SdkErr;
use risc0_ethereum_contracts::groth16::Seal;
use risc0_zkvm::{compute_image_id, Receipt};

pub struct BonsaiProver {
    url: String,
    api_key: String,
    risc0_version: String,
}

impl BonsaiProver {
    pub fn new(url: String, api_key: String) -> Self {
        Self {
            url,
            api_key,
            risc0_version: risc0_zkvm::VERSION.to_string(),
        }
    }

    pub async fn prove(
        &self,
        elf: &[u8],
        input: &[u8],
    ) -> anyhow::Result<(String, Vec<u8>, FixedBytes<32>, Vec<u8>)> {
        let client = bonsai_sdk::alpha::Client::from_parts(
            self.url.clone(),
            self.api_key.clone(),
            self.risc0_version.as_str(),
        )?;
        let client = Arc::new(client);

        // Prepare image and upload it.
        let image_id = Self::prepare_image(&client, elf)?;

        // Prepare input data and upload it.
        let input_id = client.upload_input(input.to_vec())?;

        // Start a session running the prover.
        let session_uuid = Self::create_session(client.clone(), image_id.clone(), input_id).await?;

        // Fetch the snark.
        let snark_receipt = Self::fetch_snark_proof(client.clone(), session_uuid).await?;

        let snark = snark_receipt.snark;
        log::debug!("Snark proof!: {snark:?}");

        let seal = Seal::abi_encode(snark).context("Read seal")?;
        let post_state_digest: FixedBytes<32> = snark_receipt
            .post_state_digest
            .as_slice()
            .try_into()
            .context("Read post_state_digest")?;
        let journal = snark_receipt.journal;

        Ok((image_id, journal, post_state_digest, seal))
    }

    // Compute the image_id, then upload the ELF with the image_id as its key.
    fn prepare_image(client: &bonsai_sdk::alpha::Client, elf: &[u8]) -> anyhow::Result<String> {
        println!("preparing image");

        let image_id = compute_image_id(elf)?;
        let image_id_hex = image_id.to_string();

        client.upload_img(&image_id_hex, elf.to_vec())?;

        println!("uploaded image, image_id=0x{}", image_id_hex);
        log::info!("Image ID: 0x{}", image_id_hex);

        Ok(image_id_hex)
    }

    async fn create_session(
        client: Arc<bonsai_sdk::alpha::Client>,
        image_id: String,
        input_id: String,
    ) -> Result<String, SdkErr> {
        println!("creating a session, image_id={}, input_id={}", image_id, input_id);

        let handler = tokio::task::spawn_blocking(move || {
            let session = client.create_session(image_id, input_id, vec![])?;
            println!("created session: {}", session.uuid);
            log::info!("Created session: {}", session.uuid);

            loop {
                let res = session.status(&client);
                let res = match res {
                    Ok(res) => res,
                    Err(e) => {
                        log::error!("Failed to get session status: {:?}", e);
                        return Err(e);
                    }
                };

                println!("Current status: {} - state: {}", res.status, res.state.clone().unwrap_or_default());

                match res.status.as_str() {
                    "RUNNING" => {
                        log::info!(
                            "Current status: {} - state: {} - continue polling...",
                            res.status,
                            res.state.unwrap_or_default()
                        );
                        sleep(Duration::from_secs(10));
                    }
                    "SUCCEEDED" => {
                        // Download the receipt, containing the output.
                        // let receipt_url = res
                        //     .receipt_url
                        //     .context("API error, missing receipt on completed session").unwrap();
                        // let receipt_buf = client.download(&receipt_url).unwrap();
                        // let receipt: Receipt = bincode::deserialize(&receipt_buf).unwrap();

                        println!("Session succeeded");

                        return Ok(session.uuid);
                    }
                    _ => {
                        // FAILED, TIMED_OUT, ABORTED
                        panic!(
                            "Workflow exited: {} - | err: {}",
                            res.status,
                            res.error_msg.unwrap_or_default()
                        );
                    }
                }
            }
        });

        handler.await.unwrap()
    }

    async fn fetch_snark_proof(
        client: Arc<bonsai_sdk::alpha::Client>,
        session_uuid: String,
    ) -> Result<SnarkReceipt, SdkErr> {
        println!("fetching snark proof, session_uuid={}", session_uuid);

        let handler = tokio::task::spawn_blocking(move || {
            let res = client.create_snark(session_uuid);
            let res = match res {
                Ok(res) => res,
                Err(e) => {
                    log::error!("Failed to create snark session: {:?}", e);
                    return Err(e);
                }
            };

            println!("created snark session: {}", res.uuid);
            log::info!("Created snark session: {}", res.uuid);

            loop {
                let status_res = res.status(&client)?;
                println!("Current status: {}", status_res.status);

                match status_res.status.as_str() {
                    "RUNNING" => {
                        log::info!(
                            "Current status: {} - continue polling...",
                            status_res.status
                        );
                        sleep(Duration::from_secs(10));
                    }
                    "SUCCEEDED" => {
                        println!("Session succeeded: output={:?}", status_res.output);

                        return match status_res.output {
                            Some(output) => Ok(output),
                            None => {
                                panic!("No output in snark session");
                            }
                        }
                    }
                    _ => {
                        // FAILED if the guest throws panic
                        // FAILED, TIMED_OUT, ABORTED
                        panic!(
                            "Workflow exited: {} - | err: {}",
                            status_res.status,
                            status_res.error_msg.unwrap_or_default()
                        );
                    }
                }
            }
        });

        handler.await.unwrap()
    }
}
