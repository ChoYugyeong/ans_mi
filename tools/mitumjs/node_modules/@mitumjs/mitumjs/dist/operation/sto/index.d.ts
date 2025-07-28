import { CreateSecurityTokenFact } from "./create-security-token";
import { IssueFact } from "./issue";
import { AuthorizeOperatorFact } from "./authorize-operator";
import { RevokeOperatorFact } from "./revoke-operator";
import { RedeemFact } from "./redeem";
import { SetDocumentFact } from "./set-document";
import { TransferByPartitionFact } from "./transfer-by-partition";
import { Partition } from "./partition";
import { ContractGenerator, Operation } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { Big, IP } from "../../types";
type createServiceData = {
    granularity: string | number | Big;
    defaultPartition: string | Partition;
};
export declare class STO extends ContractGenerator {
    constructor(networkID: string, api?: string | IP, delegateIP?: string | IP);
    /**
     * Generate `authorize-operator` operation to authorize an operator for the security token in specific partition.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [operator] - The operator's address to be authorized.
     * @param {string | Partition} [partition] - The partition ID.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `authorize-operator` operation.
     */
    authorizeOperator(contract: string | Address, sender: string | Address, operator: string | Address, partition: string | Partition, currency: string | CurrencyID): Operation<AuthorizeOperatorFact>;
    /**
     * Generate `create-security-token` operation to create new security token.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {createServiceData} [data] - Data required to create the security token. The properties of `createServiceData` include:
     * - {string | number | Big} `granularity` - The basic unit of the token.
     * - {string | Partition} `defaultPartition` - Capital letters with length between 3 and 10 (can include numbers)
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `create-security-token` operation
     */
    createService(contract: string | Address, sender: string | Address, data: createServiceData, currency: string | CurrencyID): Operation<CreateSecurityTokenFact>;
    /**
     * Generate `issue` operation to issue new security token in specific partition to a specified receiver.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | Partition} [partition] - The partition ID.
     * @param {string | number | Big} [amount] - The amount of tokens to issue.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `issue` operation.
     */
    issue(contract: string | Address, sender: string | Address, receiver: string | Address, partition: string | Partition, amount: string | number | Big, currency: string | CurrencyID): Operation<IssueFact>;
    /**
     * Generate `redeem` operation to redeem(burn) a specified amount of security token in a specific partition.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [tokenHolder] - The token holder's address.
     * @param {string | Partition} [partition] - The partition ID.
     * @param {string | number | Big} [amount] - The amount of tokens to redeem.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `redeem` operation.
     */
    redeem(contract: string | Address, sender: string | Address, tokenHolder: string | Address, partition: string | Partition, amount: string | number | Big, currency: string | CurrencyID): Operation<RedeemFact>;
    /**
     * Generate `revoke` operation to revoke operator's authorization for the security token in specific partition.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [operator] - The operator's address.
     * @param {string | Partition} [partition] - The partition ID.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `revoke` operation.
     */
    revokeOperator(contract: string | Address, sender: string | Address, operator: string | Address, partition: string | Partition, currency: string | CurrencyID): Operation<RevokeOperatorFact>;
    /**
     * Generate `setDocumnet` operation to set document for the security token on the contract.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [title] - The title of the document.
     * @param {string} [uri] - The URI of the document.
     * @param {string} [documentHash] - The hash value of the document.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `setDocumnet` operation.
     */
    setDocument(contract: string | Address, sender: string | Address, title: string, uri: string, documentHash: string, currency: string | CurrencyID): Operation<SetDocumentFact>;
    /**
     * Generate `transfer-by-partition` operation to transfer security token in specific partitions.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [holder] - The token holder's address.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | Partition} [partition] - The partition ID.
     * @param {string | number | Big} [amount] - The amount of tokens to transfer.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `transfer-by-partition` operation
     */
    transferByPartition(contract: string | Address, sender: string | Address, holder: string | Address, receiver: string | Address, partition: string | Partition, amount: string | number | Big, currency: string | CurrencyID): Operation<TransferByPartitionFact>;
    /**
     * Get information about the security token on the contract.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @returns `data` of `SuccessResponse` is information of the security token:
     * - `_hint`: Hint for STO design,
     * - `granularity`: Basic unit for the token,
     * - `policy`: {
     *     _hint: Hint for the STO policy,
     *     partitions: Array of name of partition,
     *     aggregate: Total supply amount,
     *     documents: Array of information about documents with `_hint`, `title`, `hash`, `uri`
     * }
     */
    getServiceInfo(contract: string | Address): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
    /**
     * Get partitions of given holder.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [holder] - The token holder's address.
     * @returns `data` of `SuccessResponse` is an array of token partition names owned by the holder.
     */
    getPartitionsInfo(contract: string | Address, holder: string | Address): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
    /**
     * Get balance of holder for the partition.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [holder] - The token holder's address.
     * @param {string} [partition] - The partition ID.
     * @returns `data` of `SuccessResponse` is the balance of holder for the partition
     */
    getBalanceByHolder(contract: string | Address, holder: string | Address, partition: string): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
    /**
     * Get operators of the partition who granted by the holder.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [holder] - The token holder's address.
     * @param {string} [partition] - The partition ID.
     * @returns `data` of `SuccessResponse` is information of the operators:
     * - `operators`: Array of the address of operators.
     */
    getOperatorsByHolder(contract: string | Address, holder: string | Address, partition: string): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
    /**
     * Get balance for a specific partition.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string} [partition] - The partition ID.
     * @returns `data` of `SuccessResponse` is the partition balance amount.
     */
    getPartitionBalanceInfo(contract: string | Address, partition: string): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
    /**
     * Get information about the holder who granted to the operator.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [operator] - The operator's address.
     * @returns `data` of `SuccessResponse` is information of holder:
     * - `holders`: Array of the address of holders.
     */
    getAuthorizedInfo(contract: string | Address, operator: string | Address): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
}
export {};
