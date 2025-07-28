/// <reference types="node" />
import { Address } from "../../key";
import { HintedObject, LongString } from "../../types";
import { CurrencyID } from "../../common";
import { Item, OperationFact } from "../base";
export declare class CreateDatasItem extends Item {
    readonly contract: Address;
    readonly currency: CurrencyID;
    readonly dataKey: LongString;
    readonly dataValue: LongString;
    constructor(contract: string | Address, currency: string | CurrencyID, dataKey: string | LongString, dataValue: string | LongString);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class CreateDatasFact extends OperationFact<CreateDatasItem> {
    constructor(token: string, sender: string | Address, items: CreateDatasItem[]);
    get operationHint(): string;
}
