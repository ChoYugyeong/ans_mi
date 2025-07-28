/// <reference types="node" />
import { IBuffer, IString } from "../types";
export declare class LongString implements IBuffer, IString {
    private s;
    constructor(s: string);
    static from(s: string | LongString): LongString;
    toBuffer(): Buffer;
    toString(): string;
}
export declare class ShortDate extends LongString {
    constructor(s: string);
    static from(s: string | ShortDate): ShortDate;
}
export declare class IP extends LongString {
    constructor(s: string);
    static from(s: string | IP): IP;
}
export declare class URIString {
    constructor(s: string, name: string);
}
