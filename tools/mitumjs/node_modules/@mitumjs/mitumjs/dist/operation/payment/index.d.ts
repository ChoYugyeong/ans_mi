import { RegisterModelFact } from "./resgister-model";
import { DepositFact } from "./deposit";
import { TransferFact } from "./transfer";
import { WithdrawFact } from "./withdraw";
import { UpdateFact } from "./update-account-setting";
import { ContractGenerator, Operation } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { IP } from "../../types";
export declare class Payment extends ContractGenerator {
    constructor(networkID: string, api?: string | IP, delegateIP?: string | IP);
    /**
     * Generate a `register-model` operation to register new payment model on the contract.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `register-model` operation.
     */
    registerModel(contract: string | Address, sender: string | Address, currency: string | CurrencyID): Operation<RegisterModelFact>;
    /**
     * Generate `deposit` operation to deposit currency to a payment model with configurable transfer settings.
     *
     * amount > 0 && end_time > start_time && duration <= (end_time - start_time)
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | number | Big} [amount] - The amount to deposit.
     * @param {string | number} [transfer_limit] - The maximum amount that can be sent in a single transaction.
     * @param {string | number | Big} [start_time] - The start time when a transfer becomes possible.
     * @param {string | number | Big} [end_time] - The end time after which a transfer is no longer allowed.
     * @param {string | number | Big} [duration] - The cooldown period (in seconds) after the last transfer, during which further transfers are blocked.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `deposit` operation
     */
    deposit(contract: string | Address, sender: string | Address, amount: string | number, transfer_limit: string | number, start_time: string | number, end_time: string | number, duration: string | number, currency: string | CurrencyID): Operation<DepositFact>;
    /**
     * Generate `update-account-setting` operation to update transfer setting.
     *
     * end_time > start_time && duration <= (end_time - start_time)
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | number} [transfer_limit] - The maximum amount that can be sent in a single transaction.
     * @param {string | number | Big} [start_time] - The start time when a transfer becomes possible.
     * @param {string | number | Big} [end_time] - The end time after which a transfer is no longer allowed.
     * @param {string | number | Big} [duration] - The cooldown period (in seconds) after the last transfer, during which further transfers are blocked.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `update-account-setting` operation
     */
    updateSetting(contract: string | Address, sender: string | Address, transfer_limit: string | number, start_time: string | number, end_time: string | number, duration: string | number, currency: string | CurrencyID): Operation<UpdateFact>;
    /**
     * Generate an `transfer` operation for transferring certain currency from the deposit to a receiver.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | number | Big} [amount] - The amount to transfer.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `transfer` operation.
     */
    transfer(contract: string | Address, sender: string | Address, receiver: string | Address, amount: string | number, currency: string | CurrencyID): Operation<TransferFact>;
    /**
     * Generate an `withdraw` operation to withdraw all deposits with certain currency at once and delete account information.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `withdraw` operation.
     */
    withdraw(contract: string | Address, sender: string | Address, currency: string | CurrencyID): Operation<WithdrawFact>;
    /**
     * Get information about a payment service on the contract.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @returns `data` of `SuccessResponse` is information about the payment service:
     * - `_hint`: Hint for the payment design structure,
     * - `transfer_settings`: A mapping of addresses to their respective payment settings,
     * - - `<address>`: A unique identifier for each user's payment setting,
     * - - - `_hint`: Hint for the payment setting structure,
     * - - - `address`: The address associated with this payment setting,
     * - - - `items`: A mapping of tokens to their transfer conditions,
     * - - - - `<currency id>`: The currency id,
     * - - - - - `transfer_limit`: The maximum amount that can be transferred,
     * - - - - - `start_time`: The start time when a transfer becomes possible,
     * - - - - - `end_time`: The end time after which a transfer is no longer allowed,
     * - - - - - `duration`: The cooldown period after the last transfer, during which further transfers are blocked.
     */
    getModelInfo(contract: string | Address): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
    /**
     * Get information about the remaining deposit and transfer settings for a given user address.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [address] - The address of account.
     * @returns `data` of `SuccessResponse` is information about the timestamp with certain tid on the certain project:
     * - `_hint`: Hint for the payment account information structure,
     * - `transfer_setting`: Transfer conditions set for the account,
     * - - `_hint`: Hint for the payment setting structure,
     * - - `address`: The address associated with this payment setting,
     * - - `items`: A mapping of tokens to their transfer conditions,
     * - - - `<currency id>`: The currency id,
     * - - - - `transfer_limit`: The maximum amount that can be transferred,
     * - - - - `start_time`: The start time when a transfer becomes possible,
     * - - - - `end_time`: The end time after which a transfer is no longer allowed,
     * - - - - `duration`: The cooldown period after the last transfer, during which further transfers are blocked.
     * - `deposit_record`: Deposit details of the account,
     * - - `_hint`: Hint for the deposit record structure,
     * - - `address`: The address associated with this deposit record,
     * - - `items`: A mapping of tokens to their deposit information,
     * - - - `<currency id>`: The currency id,
     * - - - - `amount`: The remainning deposited,
     * - - - - `transferred_at`: The timestamp of the last transfer (Unix timestamp).
     */
    getPaymentInfo(contract: string | Address, address: string | Address): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
}
