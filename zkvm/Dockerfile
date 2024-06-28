FROM rust:latest

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libssl-dev \
    pkg-config && \
    rm -rf /var/lib/apt/lists/*

# Install Risc0
RUN cargo install cargo-binstall
RUN yes "yes" | cargo binstall cargo-risczero
RUN cargo risczero install

# Clean project
RUN apt-get clean

# Install Foundry
RUN curl -L https://foundry.paradigm.xyz | bash
RUN source $HOME/.bashrc
ENV PATH="$PATH:/root/.foundry/bin"
RUN foundryup

# Build Project
COPY . /app
WORKDIR /app

RUN cargo build --release && \
    chmod +x /app/target/release/host

EXPOSE 80

CMD ["./target/release/host"]