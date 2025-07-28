/// <reference types="node" />
import { PointItem } from "./item";
import { OperationFact } from "../base";
import { Big, HintedObject } from "../../types";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
export declare class ApprovesItem extends PointItem {
    readonly approved: Address;
    constructor(contract: string | Address, approved: string | Address, amount: string | number | Big, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class ApprovesFact extends OperationFact<ApprovesItem> {
    constructor(token: string, sender: string | Address, items: ApprovesItem[]);
    get operationHint(): string;
}
