/// <reference types="node" />
import { PointItem } from "./item";
import { OperationFact } from "../base";
import { Big, HintedObject } from "../../types";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
export declare class TransfersFromItem extends PointItem {
    readonly receiver: Address;
    readonly target: Address;
    constructor(contract: string | Address, receiver: string | Address, target: string | Address, amount: string | number | Big, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class TransfersFromFact extends OperationFact<TransfersFromItem> {
    constructor(token: string, sender: string | Address, items: TransfersFromItem[]);
    get operationHint(): string;
}
