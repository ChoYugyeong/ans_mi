/// <reference types="node" />
import { Item } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { HintedObject } from "../../types";
export declare abstract class STOItem extends Item {
    readonly contract: Address;
    readonly currency: CurrencyID;
    protected constructor(hint: string, contract: string | Address, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
