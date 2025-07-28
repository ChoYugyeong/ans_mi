/// <reference types="node" />
import { STOItem } from "./item";
import { Partition } from "./partition";
import { OperationFact } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { Big, HintedObject } from "../../types";
export declare class IssueItem extends STOItem {
    readonly receiver: Address;
    readonly amount: Big;
    readonly partition: Partition;
    constructor(contract: string | Address, receiver: string | Address, amount: string | number | Big, partition: string | Partition, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class IssueFact extends OperationFact<IssueItem> {
    constructor(token: string, sender: string | Address, items: IssueItem[]);
    get operationHint(): string;
}
