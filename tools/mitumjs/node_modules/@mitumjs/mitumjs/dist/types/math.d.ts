/// <reference types="node" />
import { IBuffer, IString } from "../types";
export declare class Big implements IBuffer, IString {
    readonly big: bigint;
    constructor(big: string | number | Buffer | BigInt | Uint8Array);
    static from(big: string | number | Buffer | BigInt | Uint8Array | Big): Big;
    private bufferToBig;
    toBuffer(option?: "fill"): Buffer;
    byteLen(): number;
    get v(): number;
    toString(): string;
    overZero(): boolean;
    compare(n: string | number | Big): 1 | 0 | -1;
}
export declare class Float implements IBuffer, IString {
    readonly n: number;
    constructor(n: number);
    static from(n: number | Float): Float;
    toBuffer(): Buffer;
    toString(): string;
}
export declare class Uint8 implements IBuffer, IString {
    readonly n: number;
    constructor(n: number);
    static from(n: number | Uint8): Uint8;
    toBuffer(): Buffer;
    get v(): number;
    toString(): string;
}
export declare class Bool implements IBuffer, IString {
    private b;
    constructor(b: boolean);
    static from(b: boolean | Bool): Bool;
    toBuffer(): Buffer;
    get v(): boolean;
}
