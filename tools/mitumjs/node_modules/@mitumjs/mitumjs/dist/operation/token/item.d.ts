/// <reference types="node" />
import { Item } from "../base";
import { Big } from "../../types";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { HintedObject } from "../../types";
export declare abstract class TokenItem extends Item {
    readonly contract: Address;
    readonly currency: CurrencyID;
    readonly amount: Big;
    protected constructor(hint: string, contract: string | Address, amount: string | number | Big, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
