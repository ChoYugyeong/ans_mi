/// <reference types="node" />
import { CurrencyItem } from "./item";
import { OperationFact } from "../base";
import { Amount } from "../../common";
import { HintedObject } from "../../types";
import { Address, ZeroAddress } from "../../key";
export declare class TransferItem extends CurrencyItem {
    readonly receiver: Address | ZeroAddress;
    constructor(receiver: string | Address | ZeroAddress, amounts: Amount[]);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class TransferFact extends OperationFact<TransferItem> {
    constructor(token: string, sender: string | Address, items: TransferItem[]);
    get operationHint(): string;
}
