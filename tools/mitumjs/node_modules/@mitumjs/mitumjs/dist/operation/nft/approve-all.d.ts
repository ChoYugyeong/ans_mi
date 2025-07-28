/// <reference types="node" />
import { NFTItem } from "./item";
import { OperationFact } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { HintedObject } from "../../types";
export declare class ApproveAllItem extends NFTItem {
    readonly approved: Address;
    readonly mode: "allow" | "cancel";
    constructor(contract: string | Address, approved: string | Address, mode: "allow" | "cancel", currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class ApproveAllFact extends OperationFact<ApproveAllItem> {
    constructor(token: string, sender: string | Address, items: ApproveAllItem[]);
    get operationHint(): string;
}
