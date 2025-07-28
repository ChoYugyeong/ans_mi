/// <reference types="node" />
import { STOItem } from "./item";
import { Partition } from "./partition";
import { OperationFact } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { Big, HintedObject } from "../../types";
export declare class TransferSecurityTokenPartitionItem extends STOItem {
    readonly tokenHolder: Address;
    readonly receiver: Address;
    readonly partition: Partition;
    readonly amount: Big;
    constructor(contract: string | Address, tokenHolder: string | Address, receiver: string | Address, partition: string | Partition, amount: string | number | Big, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class TransferSecurityTokenPartitionFact extends OperationFact<TransferSecurityTokenPartitionItem> {
    constructor(token: string, sender: string | Address, items: TransferSecurityTokenPartitionItem[]);
    get operationHint(): string;
}
