/// <reference types="node" />
import { Hint } from "../../common";
import { Address } from "../../key";
import { Big, Bool, HintedObject, IBuffer, IHintedObject } from "../../types";
export declare class Signer implements IBuffer, IHintedObject {
    readonly hint: Hint;
    readonly account: Address;
    readonly share: Big;
    readonly signed: Bool;
    constructor(account: string | Address, share: string | number | Big, signed: boolean | Bool);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export declare class Signers implements IBuffer, IHintedObject {
    readonly hint: Hint;
    readonly signers: Signer[];
    constructor(signers: Signer[]);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
