/// <reference types="node" />
import { FS, GeneralFS, NodeFS } from "./types";
import { IBuffer, FullTimeStamp } from "../../types";
import { Key, Address, NodeAddress } from "../../key";
export declare abstract class FactSign implements IBuffer {
    readonly signer: Key;
    readonly signature: Buffer;
    readonly signedAt: FullTimeStamp;
    protected constructor(signer: string | Key, signature: Buffer, signedAt: string);
    toBuffer(): Buffer;
    toHintedObject(): FS;
}
export declare class GeneralFactSign extends FactSign {
    constructor(signer: string | Key, signature: Buffer, signedAt: string);
    toHintedObject(): GeneralFS;
}
export declare class NodeFactSign extends FactSign {
    readonly node: Address;
    constructor(node: string | NodeAddress, signer: string | Key, signature: Buffer, signedAt: string);
    toBuffer(): Buffer;
    toHintedObject(): NodeFS;
}
