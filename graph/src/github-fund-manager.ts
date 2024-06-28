import { BigInt, ByteArray, Bytes, crypto } from "@graphprotocol/graph-ts";
import {
  GitHubAccountAssociated as GitHubAccountAssociatedEvent,
  RepositoryAdded as RepositoryAddedEvent,
  TokenDistributed as TokenDistributedEvent,
  TokenFundedToRepository as TokenFundedToRepositoryEvent,
  TokenWithdrawn as TokenWithdrawnEvent,
} from "../generated/GitHubFundManager/GitHubFundManager";
import {
  FundHistory as FundHistoryEntity,
  RepositoryContributor as RepositoryContributorEntity,
  Repository as RepositoryEntity,
  RepositoryFund as RepositoryFundEntity,
  UserAccount as UserAccountEntity,
  DistributedHistory as DistributedHistoryEntity,
  WithdrawHistory as WithdrawHistoryEntity,
} from "../generated/schema";

export function handleGitHubAccountAssociated(
  event: GitHubAccountAssociatedEvent
): void {
  const hashOfLogin = crypto.keccak256(
    ByteArray.fromUTF8(event.params.githubLogin)
  );
  const id = Bytes.fromHexString(hashOfLogin.toHexString());
  let entity = UserAccountEntity.load(id);
  if (entity === null) {
    entity = new UserAccountEntity(id);
  }

  entity.name = event.params.githubLogin;
  entity.address = event.params.user;

  entity.save();
}

export function handleRepositoryAdded(event: RepositoryAddedEvent): void {
  const entity = new RepositoryEntity(
    event.params.repositoryIndex.toHexString()
  );

  entity.index = event.params.repositoryIndex;
  entity.organization = event.params.githubOrganization;
  entity.name = event.params.githubRepository;
  entity.numberFunded = BigInt.fromU32(0);

  entity.save();
}

export function handleTokenFundedToRepository(
  event: TokenFundedToRepositoryEvent
): void {
  // FundHistory
  // (Repository ID + Fund ID)
  const fundHistoryId = ByteArray.fromBigInt(
    event.params.repositoryIndex
  ).concat(ByteArray.fromBigInt(event.params.fundIndex));

  const fundHistory = new FundHistoryEntity(fundHistoryId.toHexString());
  fundHistory.index = event.params.fundIndex;
  fundHistory.funder = event.params.funder;
  fundHistory.tokenAddress = event.params.tokenAddress;
  fundHistory.amount = event.params.amount;
  fundHistory.timestamp = event.block.timestamp;
  fundHistory.transactionHash = event.transaction.hash;
  fundHistory.blockHash = event.block.hash;
  fundHistory.blockHeight = event.block.number;
  fundHistory.repository = event.params.repositoryIndex.toHexString();

  fundHistory.save();

  // RepositoryFund
  // (Repository ID + Token Address)
  const repositoryFundId = ByteArray.fromBigInt(
    event.params.repositoryIndex
  ).concat(event.params.tokenAddress);
  let repositoryFund = RepositoryFundEntity.load(
    repositoryFundId.toHexString()
  );
  if (repositoryFund === null) {
    const repository = RepositoryEntity.load(event.params.repositoryIndex.toHexString());

    repositoryFund = new RepositoryFundEntity(repositoryFundId.toHexString());
    repositoryFund.organizationAndRepository = repository !== null ? `${repository.organization}/${repository.name}` : 'N/A'
    repositoryFund.tokenAddress = event.params.tokenAddress;
    repositoryFund.fundedTimes = BigInt.fromI32(0);
    repositoryFund.funded = BigInt.fromI32(0);
    repositoryFund.withdrawn = BigInt.fromI32(0);
    repositoryFund.repository = event.params.repositoryIndex.toHexString();
  }

  repositoryFund.fundedTimes = repositoryFund.fundedTimes.plus(BigInt.fromU32(1));
  repositoryFund.funded = repositoryFund.funded.plus(event.params.amount);
  repositoryFund.save();

  // Repository
  let repository = RepositoryEntity.load(
    event.params.repositoryIndex.toHexString()
  );
  if (repository === null) {
    repository = new RepositoryEntity(
      event.params.repositoryIndex.toHexString()
    );
    repository.numberFunded = BigInt.fromU32(0);
  }
  repository.numberFunded = repository.numberFunded.plus(BigInt.fromU32(1));
  repository.save();
}

export function handleTokenDistributed(
  event: TokenDistributedEvent
): void {
  for (let index = 0; index < event.params.githubLogins.length; index++) {
    const githubLogin = event.params.githubLogins[index];
    const amount = event.params.amounts[index];

    // (Repository ID + GitHub Login + Token Address)
    const repositoryContributorId = ByteArray.fromBigInt(
      event.params.repositoryIndex
    )
      .concat(ByteArray.fromUTF8(githubLogin))
      .concat(ByteArray.fromHexString(event.params.tokenAddress.toHexString()))
      .toHexString();

    let repositoryContributor = RepositoryContributorEntity.load(
      repositoryContributorId
    );
    if (repositoryContributor === null) {
      repositoryContributor = new RepositoryContributorEntity(
        repositoryContributorId
      );
      repositoryContributor.name = githubLogin
      repositoryContributor.tokenAddress = event.params.tokenAddress;
      repositoryContributor.distributed = BigInt.fromI32(0);
      repositoryContributor.withdrawn = BigInt.fromI32(0);
      repositoryContributor.repositoryID = event.params.repositoryIndex.toHexString();
      repositoryContributor.repository =
        event.params.repositoryIndex.toHexString();
      repositoryContributor.account = Bytes.fromHexString(
        crypto
          .keccak256(ByteArray.fromUTF8(githubLogin))
          .toHexString()
      );
    }

    repositoryContributor.distributed = repositoryContributor.distributed.plus(
      amount
    );
    repositoryContributor.save();

    // Distributed History
    const distributeHistoryId = ByteArray.fromBigInt(
      event.params.repositoryIndex
    ).concat(ByteArray.fromBigInt(event.params.fundIndex))
      .concat(ByteArray.fromUTF8(githubLogin));
    const distributeHistory = new DistributedHistoryEntity(distributeHistoryId.toHexString())
    distributeHistory.amount = amount;
    distributeHistory.account = Bytes.fromHexString(crypto.keccak256(
      ByteArray.fromUTF8(githubLogin)
    ).toHexString());
    distributeHistory.fundHistory = ByteArray.fromBigInt(
      event.params.repositoryIndex
    ).concat(ByteArray.fromBigInt(event.params.fundIndex))
      .toHexString();
    distributeHistory.save();
  }
}

export function handleTokenWithdrawn(
  event: TokenWithdrawnEvent
): void {
  // WithdrawHistory
  // Concat(Repository Index + GitHub Login + Block Number)
  const withdrawHistoryId = ByteArray.fromBigInt(event.params.repositoryIndex)
    .concat(ByteArray.fromUTF8(event.params.githubLogin))
    .concat(ByteArray.fromBigInt(event.block.number))
    .toHexString();

  const withdrawHistory = new WithdrawHistoryEntity(withdrawHistoryId);
  withdrawHistory.recipient = event.params.recipient;
  withdrawHistory.tokenAddress = event.params.tokenAddress;
  withdrawHistory.amount = event.params.amount;
  withdrawHistory.timestamp = event.block.timestamp;
  withdrawHistory.transactionHash = event.transaction.hash;
  withdrawHistory.blockHash = event.block.hash;
  withdrawHistory.blockHeight = event.block.number;
  withdrawHistory.account = Bytes.fromHexString(
    crypto.keccak256(ByteArray.fromUTF8(event.params.githubLogin)).toHexString()
  );
  withdrawHistory.repository = event.params.repositoryIndex.toHexString();
  withdrawHistory.save();

  // RepositoryFund
  const repositoryFundId = ByteArray.fromBigInt(
    event.params.repositoryIndex
  ).concat(event.params.tokenAddress);
  const repositoryFund = RepositoryFundEntity.load(
    repositoryFundId.toHexString()
  );
  if (repositoryFund !== null) {
    repositoryFund.withdrawn = repositoryFund.withdrawn.plus(event.params.amount);
    repositoryFund.save();
  }

  // RepositoryContributor
  const repositoryContributorId = ByteArray.fromBigInt(
    event.params.repositoryIndex
  )
    .concat(ByteArray.fromUTF8(event.params.githubLogin))
    .concat(ByteArray.fromHexString(event.params.tokenAddress.toHexString()))
    .toHexString();
  let repositoryContributor = RepositoryContributorEntity.load(
    repositoryContributorId
  );
  if (repositoryContributor === null) {
    repositoryContributor = new RepositoryContributorEntity(
      repositoryContributorId
    );
    repositoryContributor.name = event.params.githubLogin;
    repositoryContributor.tokenAddress = event.params.tokenAddress;
    repositoryContributor.distributed = BigInt.fromI32(0);
    repositoryContributor.withdrawn = BigInt.fromI32(0);
    repositoryContributor.repository =
      event.params.repositoryIndex.toHexString();
    repositoryContributor.account = Bytes.fromHexString(
      crypto
        .keccak256(ByteArray.fromUTF8(event.params.githubLogin))
        .toHexString()
    );
  }
  repositoryContributor.withdrawn = repositoryContributor.withdrawn.plus(
    event.params.amount
  );
  repositoryContributor.save();
}
