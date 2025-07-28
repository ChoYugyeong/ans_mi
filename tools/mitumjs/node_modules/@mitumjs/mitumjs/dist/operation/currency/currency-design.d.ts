/// <reference types="node" />
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { Big, Float, HintedObject, IBuffer, IHintedObject } from "../../types";
export declare class CurrencyDesign implements IBuffer, IHintedObject {
    private static hint;
    readonly initialSupply: Big;
    readonly currencyID: CurrencyID;
    readonly policy: CurrencyPolicy;
    readonly genesisAccount: Address;
    readonly totalSupply: Big;
    readonly decimal: Big;
    constructor(initialSupply: string | number | Big, currencyID: string | CurrencyID, genesisAccount: string | Address, decimal: string | number | Big, policy: CurrencyPolicy);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export declare class CurrencyPolicy implements IBuffer, IHintedObject {
    private static hint;
    readonly newAccountMinBalance: Big;
    readonly feeer: Feeer;
    constructor(newAccountMinBalance: string | number | Big, feeer: Feeer);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
declare abstract class Feeer implements IBuffer, IHintedObject {
    private hint;
    readonly exchangeMinAmount?: Big;
    constructor(hint: string, exchangeMinAmount?: string | number | Big);
    abstract toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export declare class NilFeeer extends Feeer {
    constructor();
    toBuffer(): Buffer;
}
export declare class FixedFeeer extends Feeer {
    readonly receiver: Address;
    readonly amount: Big;
    constructor(receiver: string | Address, amount: string | number | Big);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export declare class RatioFeeer extends Feeer {
    readonly receiver: Address;
    readonly ratio: Float;
    readonly min: Big;
    readonly max: Big;
    constructor(receiver: string | Address, ratio: number, min: string | number | Big, max: string | number | Big);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export {};
