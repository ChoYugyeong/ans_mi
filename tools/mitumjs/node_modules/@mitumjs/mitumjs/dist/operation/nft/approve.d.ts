/// <reference types="node" />
import { NFTItem } from "./item";
import { OperationFact } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { Big, HintedObject } from "../../types";
export declare class ApproveItem extends NFTItem {
    readonly approved: Address;
    readonly nftIdx: Big;
    constructor(contract: string | Address, approved: string | Address, nftIdx: string | number | Big, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class ApproveFact extends OperationFact<ApproveItem> {
    constructor(token: string, sender: string | Address, items: ApproveItem[]);
    get operationHint(): string;
}
