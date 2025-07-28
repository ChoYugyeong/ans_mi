/// <reference types="node" />
import { CurrencyItem } from "./item";
import { OperationFact } from "../base";
import { Amount } from "../../common";
import { HintedObject } from "../../types";
import { Keys, Address } from "../../key";
export declare class CreateContractAccountItem extends CurrencyItem {
    readonly keys: Keys;
    constructor(keys: Keys, amounts: Amount[]);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class CreateContractAccountFact extends OperationFact<CreateContractAccountItem> {
    constructor(token: string, sender: string | Address, items: CreateContractAccountItem[]);
    get operationHint(): string;
}
