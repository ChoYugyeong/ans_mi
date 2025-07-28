/// <reference types="node" />
import { NFTItem } from "./item";
import { OperationFact } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { Big, HintedObject } from "../../types";
export declare class AddSignatureItem extends NFTItem {
    readonly nftIdx: Big;
    constructor(contract: string | Address, nftIdx: string | number | Big, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export declare class AddSignatureFact extends OperationFact<AddSignatureItem> {
    constructor(token: string, sender: string | Address, items: AddSignatureItem[]);
    get operationHint(): string;
}
