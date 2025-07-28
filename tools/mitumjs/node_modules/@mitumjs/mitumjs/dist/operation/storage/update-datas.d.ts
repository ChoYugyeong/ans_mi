/// <reference types="node" />
import { Address } from "../../key";
import { HintedObject, LongString } from "../../types";
import { CurrencyID } from "../../common";
import { Item, OperationFact } from "../base";
export declare class UpdateDatasItem extends Item {
    readonly contract: Address;
    readonly currency: CurrencyID;
    readonly dataKey: LongString;
    readonly dataValue: LongString;
    constructor(contract: string | Address, currency: string | CurrencyID, dataKey: string | LongString, dataValue: string | LongString);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class UpdateDatasFact extends OperationFact<UpdateDatasItem> {
    constructor(token: string, sender: string | Address, items: UpdateDatasItem[]);
    get operationHint(): string;
}
