/// <reference types="node" />
import { CurrencyItem } from "./item";
import { OperationFact } from "../base";
import { Address } from "../../key";
import { Amount } from "../../common";
import { HintedObject } from "../../types";
export declare class WithdrawItem extends CurrencyItem {
    readonly target: Address;
    constructor(target: string | Address, amounts: Amount[]);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class WithdrawFact extends OperationFact<WithdrawItem> {
    constructor(token: string, sender: string | Address, items: WithdrawItem[]);
    get operationHint(): string;
}
