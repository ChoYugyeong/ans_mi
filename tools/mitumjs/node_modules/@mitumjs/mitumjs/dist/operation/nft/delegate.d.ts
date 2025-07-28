/// <reference types="node" />
import { NFTItem } from "./item";
import { OperationFact } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { HintedObject } from "../../types";
export declare class DelegateItem extends NFTItem {
    readonly operator: Address;
    readonly mode: "allow" | "cancel";
    constructor(contract: string | Address, operator: string | Address, mode: "allow" | "cancel", currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class DelegateFact extends OperationFact<DelegateItem> {
    constructor(token: string, sender: string | Address, items: DelegateItem[]);
    get operationHint(): string;
}
