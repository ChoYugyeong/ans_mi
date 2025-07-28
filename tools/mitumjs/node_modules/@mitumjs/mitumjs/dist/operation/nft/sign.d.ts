/// <reference types="node" />
import { NFTItem } from "./item";
import { OperationFact } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { Big, HintedObject } from "../../types";
export declare class SignItem extends NFTItem {
    readonly nft: Big;
    constructor(contract: string | Address, nft: string | number | Big, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export declare class SignFact extends OperationFact<SignItem> {
    constructor(token: string, sender: string | Address, items: SignItem[]);
    get operationHint(): string;
}
