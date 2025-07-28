import { RegisterModelFact } from "./register-model";
import { MintFact } from "./mint";
import { BurnFact } from "./burn";
import { TransferFact } from "./transfer";
import { TransfersFact } from "./transfers";
import { ApproveFact } from "./approve";
import { ApprovesFact } from "./approves";
import { TransferFromFact } from "./transfer-from";
import { TransfersFromFact } from "./transfers-from";
import { ContractGenerator, Operation } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { Big, IP, LongString } from "../../types";
export declare class Point extends ContractGenerator {
    constructor(networkID: string, api?: string | IP, delegateIP?: string | IP);
    /**
     * Generate a `register-model` operation to register new point model on a contract.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | LongString} [name] - The name of the point to register.
     * @param {string | CurrencyID} [symbol] - The symbol of the point to register.
     * @param {string | number | Big} [decimal] - (Optional) The decimal number to the point to register. If not provided, the default value is 0.
     * @param {string | number | Big} [initialSupply] - (Optional) The initial supply of the point to register. If not provided, the default value is 0.
     * @returns `register-model` operation.
     */
    registerModel(contract: string | Address, sender: string | Address, currency: string | CurrencyID, name: string | LongString, symbol: string | CurrencyID, decimal?: string | number | Big, initialSupply?: string | number | Big): Operation<RegisterModelFact>;
    /**
     * Generate a `mint` operation for minting points and allocating them to a receiver.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | number | Big} [amount] - The amount to mint.
     * @returns `mint` operation.
     */
    mint(contract: string | Address, sender: string | Address, currency: string | CurrencyID, receiver: string | Address, amount: string | number | Big): Operation<MintFact>;
    /**
     * Generate a `burn` operation for burning points from sender account.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | number | Big} [amount] - The amount to burn.
     * @returns `burn` operation
     */
    burn(contract: string | Address, sender: string | Address, currency: string | CurrencyID, amount: string | number | Big): Operation<BurnFact>;
    /**
     * Generate an `transfer` operation for transferring points from the sender to a receiver.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | number | Big} [amount] - The amount to transfer.
     * @returns `transfer` operation.
     */
    transfer(contract: string | Address, sender: string | Address, currency: string | CurrencyID, receiver: string | Address, amount: string | number | Big): Operation<TransferFact>;
    /**
     * Generate an `transfers` operation with multi items to transfer points from the sender to a receiver.
     * @param {string | Address | string[] | Address[]} [contract] - A single contract address (converted to an array) or an array of multiple contract addresses.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string[] | Address[]} [receiver] - The array of receiver's address.
     * @param {string[] | number[] | Big[]} [amount] - The array of amounts to transfer.
     * @returns `transfers` operation with multi items.
     */
    multiTransfer(contract: string | Address | string[] | Address[], sender: string | Address, currency: string | CurrencyID, receiver: string[] | Address[], amount: string[] | number[] | Big[]): Operation<TransfersFact>;
    /**
     * Generate a `transfer-from` operation for transferring points from target account to receiver.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | Address} [target] - The target account's address.
     * @param {string | number | Big} [amount] - The amount to transfer.
     * @returns `transfer-from` operation.
     */
    transferFrom(contract: string | Address, sender: string | Address, currency: string | CurrencyID, receiver: string | Address, target: string | Address, amount: string | number | Big): Operation<TransferFromFact>;
    /**
     * Generate a `transfers-from` operation with multi item to transfer points from targets account to receivers.
     * @param {string | Address | string[] | Address[]} [contract] - A single contract address (converted to an array) or an array of multiple contract addresses.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string[] | Address[]} [receiver] - The array of receiver's addresses.
     * @param {string[] | Address[]} [target] - The array of target account's addresses.
     * @param {string[] | number[] | Big[]} [amount] - The array of amounts to transfer.
     * @returns `transfer-from` operation.
     */
    multiTransferFrom(contract: string | Address | string[] | Address[], sender: string | Address, currency: string | CurrencyID, receiver: string[] | Address[], target: string[] | Address[], amount: string[] | number[] | Big[]): Operation<TransfersFromFact>;
    /**
     * Generate an `approve` operation for approving certain amount points to approved account.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | Address} [approved] - The address to approve.
     * @param {string | number | Big} [amount] - The amount to approve.
     * @returns `approve` operation
     */
    approve(contract: string | Address, sender: string | Address, currency: string | CurrencyID, approved: string | Address, amount: string | number | Big): Operation<ApproveFact>;
    /**
     * Generate an `approves` operation with multi items to approve certain amount points to approved account.
     * @param {string | Address | string[] | Address[]} [contract] - A single contract address (converted to an array) or an array of multiple contract addresses.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string[] | Address[]} [approved] - The array of addresses to approve.
     * @param {string[] | number[] | Big[]} [amount] - The array amounts to approve.
     * @returns `approves` operation with multi item
     */
    multiApprove(contract: string | Address | string[] | Address[], sender: string | Address, currency: string | CurrencyID, approved: string[] | Address[], amount: string[] | number[] | Big[]): Operation<ApprovesFact>;
    /**
     * Get information about the specific point model on the contract.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @returns `data` of `SuccessResponse` is point information:
     * - `_hint`: Hint for point design,
     * - `symbol`: Symbol of the point,
     * - `name`: Name of the point,
     * - `policy`: Point policy object including `_hint`, `total_supply`, `approve_list`
     */
    getModelInfo(contract: string | Address): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
    /**
     * Get the allowance information granted by the owner for a specific point.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [owner] - The point owner's address.
     * @param {string | Address} [approved] - Address of approved account.
     * @returns `data` of `SuccessResponse` is point allowance information:
     * - `amount`: String of allowance amount
     */
    getAllowance(contract: string | Address, owner: string | Address, approved: string | Address): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
    /**
     * Get point balance for given account.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [account] - The point owner's address.
     * @returns `data` of `SuccessResponse` is point balance information:
     * - `amount`: String of amount
     */
    getBalance(contract: string | Address, account: string | Address): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
}
