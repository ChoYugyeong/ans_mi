/// <reference types="node" />
import { STOItem } from "./item";
import { Partition } from "./partition";
import { OperationFact } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { HintedObject } from "../../types";
export declare class AuthorizeOperatorItem extends STOItem {
    readonly operator: Address;
    readonly partition: Partition;
    constructor(contract: string | Address, operator: string | Address, partition: string | Partition, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class AuthorizeOperatorFact extends OperationFact<AuthorizeOperatorItem> {
    constructor(token: string, sender: string | Address, items: AuthorizeOperatorItem[]);
    get operationHint(): string;
}
