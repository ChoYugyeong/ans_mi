/// <reference types="node" />
import { IBuffer, IString } from "../../types";
export declare class Partition implements IBuffer, IString {
    private s;
    constructor(s: string);
    static from(s: string | Partition): Partition;
    toBuffer(): Buffer;
    toString(): string;
}
