/// <reference types="node" />
import { IBuffer, IString } from "../types";
declare abstract class ID implements IBuffer, IString {
    private s;
    constructor(s: string);
    equal(id: ID): boolean;
    toBuffer(): Buffer;
    toString(): string;
}
export declare class CurrencyID extends ID {
    constructor(s: string);
    static from(s: string | CurrencyID): CurrencyID;
}
export {};
