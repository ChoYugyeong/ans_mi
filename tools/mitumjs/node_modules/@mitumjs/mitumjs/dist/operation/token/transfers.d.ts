/// <reference types="node" />
import { TokenItem } from "./item";
import { OperationFact } from "../base";
import { Big, HintedObject } from "../../types";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
export declare class TransfersItem extends TokenItem {
    readonly receiver: Address;
    constructor(contract: string | Address, receiver: string | Address, amount: string | number | Big, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class TransfersFact extends OperationFact<TransfersItem> {
    constructor(token: string, sender: string | Address, items: TransfersItem[]);
    get operationHint(): string;
}
