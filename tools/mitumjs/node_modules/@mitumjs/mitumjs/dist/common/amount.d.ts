/// <reference types="node" />
import { CurrencyID } from "./id";
import { Big, HintedObject, IBuffer, IHintedObject } from "../types";
export declare class Amount implements IBuffer, IHintedObject {
    private hint;
    readonly currency: CurrencyID;
    readonly big: Big;
    constructor(currency: string | CurrencyID, big: string | number | Big);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export declare class Fee implements IBuffer, IHintedObject {
    private hint;
    readonly currency: CurrencyID;
    readonly big: Big;
    constructor(currency: string | CurrencyID, big: string | number | Big);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
