/// <reference types="node" />
import { KYCItem } from "./item";
import { OperationFact } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { HintedObject } from "../../types";
export declare class RemoveControllerItem extends KYCItem {
    readonly controller: Address;
    constructor(contract: string | Address, controller: string | Address, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class RemoveControllerFact extends OperationFact<RemoveControllerItem> {
    constructor(token: string, sender: string | Address, items: RemoveControllerItem[]);
    get operationHint(): string;
}
