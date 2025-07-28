import { RegisterModelFact } from "./register-model";
import { ProposeFact } from "./propose";
import { CancelProposalFact } from "./cancel-proposal";
import { RegisterFact } from "./register";
import { PreSnapFact } from "./pre-snap";
import { PostSnapFact } from "./post-snap";
import { VoteFact } from "./vote";
import { ExecuteFact } from "./execute";
import { CryptoProposal, BizProposal } from "./proposal";
import { TransferCalldata, GovernanceCalldata } from "./proposal";
import { ContractGenerator, Operation } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { Big, IP, LongString } from "../../types";
import { UpdateModelConfigFact } from "./update-model-config";
type policyData = {
    votingPowerToken: string | CurrencyID;
    threshold: string | number | Big;
    proposalFee: string | number | Big;
    proposerWhitelist: (string | Address)[];
    proposalReviewPeriod: string | number | Big;
    registrationPeriod: string | number | Big;
    preSnapshotPeriod: string | number | Big;
    votingPeriod: string | number | Big;
    postSnapshotPeriod: string | number | Big;
    executionDelayPeriod: string | number | Big;
    turnout: string | number | Big;
    quorum: string | number | Big;
};
type daoData = policyData & {
    option: "crypto" | "biz";
};
export declare class DAO extends ContractGenerator {
    constructor(networkID: string, api?: string | IP, delegateIP?: string | IP);
    /**
     * Generate `register-model` operation to register a new DAO model on the contract.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {daoData} [data] - Data for policy of DAO service to create. The properties of `daoData` include:
     * - {'crypto' | 'biz'} `option` - Option indicates the type of proposal to be registered.
     * - {string | CurrencyID} `votingPowerToken` - The currency ID to be used when calculating voting power.
     * - {string | number | Big} `threshold` - The minimum balance of a proposer must hold after paying for the proposal fee.
     * - {string | number | Big} `proposalFee` - The fee paid when registering a proposal.
     * - {(string | Address)[]} `proposerWhitelist` - An array of addresses for accounts who can propose the new proposals.
     * - {string | number | Big} `proposalReviewPeriod` - The duration of the proposal review period (in seconds).
     * - {string | number | Big} `registrationPeriod` - The duration of the registration period (in seconds).
     * - {string | number | Big} `preSnapshotPeriod` - The duration of the pre-snapshot period (in seconds).
     * - {string | number | Big} `votingPeriod` - The duration of the voting period (in seconds).
     * - {string | number | Big} `postSnapshotPeriod` - The duration of the post-snapshot period (in seconds).
     * - {string | number | Big} `executionDelayPeriod` - The duration of the execution delay period (in seconds).
     * - {string | number | Big} `turnout` - The minimum rate of attendees for a proposal to pass (in percentage)
     * - {string | number | Big} `quorum` - The minimum rate of upvotes for a proposal to pass (in percentage)
     * @param {string | CurrencyID} currency - The currency ID.
     * @returns `register-model` operation.
     */
    registerModel(contract: string | Address, sender: string | Address, data: daoData, currency: string | CurrencyID): Operation<RegisterModelFact>;
    /**
     * Generate `update-model-config` operation for updating the DAO policy on the contract.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {daoData} [data] - Data for policy of DAO service to update. The properties of `daoData` include:
     * - {'crypto' | 'biz'} `option` - Option indicates the type of proposal to be registered.
     * - {string | CurrencyID} `votingPowerToken` - The currency ID to be used when calculating voting power.
     * - {string | number | Big} `threshold` - The minimum balance of a proposer must hold after paying for the proposal fee.
     * - {string | number | Big} `proposalFee` - The fee paid when registering a proposal.
     * - {(string | Address)[]} `proposerWhitelist` - An array of addresses for accounts who can propose the new proposals.
     * - {string | number | Big} `proposalReviewPeriod` - The duration of the proposal review period (in seconds).
     * - {string | number | Big} `registrationPeriod` - The duration of the registration period (in seconds).
     * - {string | number | Big} `preSnapshotPeriod` - The duration of the pre-snapshot period (in seconds).
     * - {string | number | Big} `votingPeriod` - The duration of the voting period (in seconds).
     * - {string | number | Big} `postSnapshotPeriod` - The duration of the post-snapshot period (in seconds).
     * - {string | number | Big} `executionDelayPeriod` - The duration of the execution delay period (in seconds).
     * - {string | number | Big} `turnout` - The minimum rate of attendees for a proposal to pass (in percentage)
     * - {string | number | Big} `quorum` - The minimum rate of upvotes for a proposal to pass (in percentage)
     * @param {string | CurrencyID} currency - The currency ID.
     * @returns `update-model-config` operation
     */
    updateModelConfig(contract: string | Address, sender: string | Address, data: daoData, currency: string | CurrencyID): Operation<UpdateModelConfigFact>;
    /**
     * Create transfer calldata for the crypto proposal to transfer crypto currency.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | number | Big} [amount] - The amount to transfer.
     * @returns Transfer calldata.
     */
    formTransferCalldata(sender: string | Address, receiver: string | Address, currency: string | CurrencyID, amount: string | number | Big): TransferCalldata;
    /**
     * Create governance calldata for the crypto proposal to update DAO policy.
     * @param {policyData} [data] - Data for policy of DAO service to update. The properties of `policyData` include:
     * - {string | CurrencyID} `votingPowerToken` - The currency ID to be used when calculating voting power.
     * - {string | number | Big} `threshold` - The minimum balance of a proposer must hold after paying for the proposal fee.
     * - {string | number | Big} `proposalFee` - The fee paid when registering a proposal.
     * - {(string | Address)[]} `proposerWhitelist` - An array of addresses for accounts who can propose the new proposals.
     * - {string | number | Big} `proposalReviewPeriod` - The duration of the proposal review period (in seconds).
     * - {string | number | Big} `registrationPeriod` - The duration of the registration period (in seconds).
     * - {string | number | Big} `preSnapshotPeriod` - The duration of the pre-snapshot period (in seconds).
     * - {string | number | Big} `votingPeriod` - The duration of the voting period (in seconds).
     * - {string | number | Big} `postSnapshotPeriod` - The duration of the post-snapshot period (in seconds).
     * - {string | number | Big} `executionDelayPeriod` - The duration of the execution delay period (in seconds).
     * - {string | number | Big} `turnout` - The minimum rate of attendees for a proposal to pass (in percentage)
     * - {string | number | Big} `quorum` - The minimum rate of upvotes for a proposal to pass (in percentage)
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns governance calldata.
     */
    formSetPolicyCalldata(data: policyData, currency: string | CurrencyID): GovernanceCalldata;
    /**
     * Write a crypto proposal include `TransferCalldata` or `GovernanceCalldata` .
     * @param {string} [proposer] - The address of the proposer.
     * @param {number} [startTime] - The time to start `proposalReviewPeriod` (in UTC timestamp).
     * @param {TransferCalldata | GovernanceCalldata} [calldata] - Calldata for the crypto proposal.
     * @returns Crypto proposal to be proposed.
     */
    writeCryptoProposal(proposer: string, startTime: number, calldata: TransferCalldata | GovernanceCalldata): CryptoProposal;
    /**
     * Write a business proposal providing multiple choice voting.
     * @param {string | Address} [proposer] - The address of the proposer.
     * @param {string | number | Big} [startTime] - The time to start `proposalReviewPeriod` (in UTC timestamp).
     * @param {string | LongString} [url] - The URL associated with the proposal.
     * @param {string | LongString} [hash] - The hash associated with the proposal.
     * @param {string | number | Big} [options] - The number of multiple choices.
     * @returns Business proposal to be proposed.
     */
    writeBizProposal(proposer: string | Address, startTime: string | number | Big, url: string | LongString, hash: string | LongString, options: string | number | Big): BizProposal;
    /**
     * Generate `propose` operation for propose a new proposal. Only the account in the whitelist can propose.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [proposalID] - The unique identifier for the proposal.
     * @param {CryptoProposal | BizProposal} [proposal] - The proposal written by `writeBizProposal` or `writeCryptoProposal`.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `propose` operation.
     */
    propose(contract: string | Address, sender: string | Address, proposalID: string, proposal: CryptoProposal | BizProposal, currency: string | CurrencyID): Operation<ProposeFact>;
    /**
     * Generate `register` operation to register to get voting right to the proposal. If approved is given, delegate voting rights to the account.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [proposalID] - The proposal ID.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | Address} [approved] - (Optional) The address of the account to which voting rights will be delegated..
     * @returns `register` operation
     */
    register(contract: string | Address, sender: string | Address, proposalID: string, currency: string | CurrencyID, approved?: string | Address): Operation<RegisterFact>;
    /**
     * Generate `cancel-proposal` operation to cancel a DAO proposal.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [proposalID] - The unique identifier for the proposal.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `cancel-proposal` operation
     */
    cancelProposal(contract: string | Address, sender: string | Address, proposalID: string, currency: string | CurrencyID): Operation<CancelProposalFact>;
    /**
     * Generate `pre-snap` operation to take a snapshot before the voting period.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [proposalID] - The proposal ID.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `pre-snap` operation.
     */
    preSnap(contract: string | Address, sender: string | Address, proposalID: string, currency: string | CurrencyID): Operation<PreSnapFact>;
    /**
     * Generate `vote` operation to cast a vote for the proposal.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [proposalID] - The proposal ID.
     * @param {number} [voteOption] - The option chosen for the vote. (crypto: 0-approve, 1-disapprove, biz: choose from multiple choices)
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `vote` operation.
     */
    vote(contract: string | Address, sender: string | Address, proposalID: string, voteOption: number, currency: string | CurrencyID): Operation<VoteFact>;
    /**
     * Generate `post-snap` operation to take a snapshot after the voting period.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [proposalID] - The proposal ID.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `post-snap` operation
     */
    postSnap(contract: string | Address, sender: string | Address, proposalID: string, currency: string | CurrencyID): Operation<PostSnapFact>;
    /**
     * Generate `execute` operation to reflect voting results.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [proposalID] - The proposal ID.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `execute` operation
     */
    execute(contract: string | Address, sender: string | Address, proposalID: string, currency: string | CurrencyID): Operation<ExecuteFact>;
    /**
     * Get DAO model information for a specific contract address.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @returns `data` of `SuccessResponse` is information of the DAO service:
     * - `_hint`: Hint for dao design,
     * - `option`: 'biz' or 'crypto',
     * - `policy`: [Policy]
     */
    getModelInfo(contract: string | Address): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
    /**
     * Get information about a specific DAO proposal. The `status` does not accurately reflect the current state of the proposal because it is updated only when an operation occurs.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string} [proposalID] - The proposal ID.
     * @returns `data` of `SuccessResponse` is information about the DAO proposal:
     * - `_hint`: Hint for the dao proposal state value,
     * - `reason`: Indicates the reason if the propose was canceled before voting,
     * - `status`: Proposal status - Proposed (0), Canceled (1), PreSnapped (2), PostSnapped (3), Completed (4), Rejected (5), Executed (6), NilStatus (7),
     * - `proposal`: [BizProposal] or [CryptoProposal],
     * - `policy`: [Policy]
     */
    getProposal(contract: string | Address, proposalID: string): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
    /**
     * Get the approved account who has taken over the voting rights from the registrant account.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string} [proposalID] - The proposal ID.
     * @param {string | Address} [account] - The address of the account that has approved another account.
     * @returns `data` of `SuccessResponse` is approval information:
     * - `_hint`: Hint for DAO approval voting info,
     * - `account`: Address of the registrant that has approved another account,
     * - `approved`: Address of the approved account,
     */
    getApproved(contract: string | Address, proposalID: string, account: string | Address): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
    /**
     * Get information about voters in a specific DAO proposal.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string} [proposalID] - The proposal ID.
     * @returns `data` of `SuccessResponse` is an array of information of the voters:
     * - `_hint`: Hint for dao voter,
     * - `voter`: Address of account that can vote,
     * - `votring_power_holders`: List of accounts that have delegated their voting power to voter.
     */
    getVoters(contract: string | Address, proposalID: string): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
    /**
     * Get the status of the voting for the proposal.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string} [proposalID] - The proposal ID.
     * @returns `data` of `SuccessResponse` is information of voting power and the voting result:
     * - `_hint`: Hint for voting power box.
     * - `total`: Total voting power.
     * - `voting_powers`: Object mapping registered account addresses to their corresponding voting information represents `_hint`, `account`,`voted`, `vote_for`, `voting_power`.
     * - `result`: Object consisting of the selected option and the number of votes.
     */
    getVotingStatus(contract: string | Address, proposalID: string): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
}
export {};
