/// <reference types="node" />
import { Address } from "./address";
import { KeyPairType } from "./types";
import { Big, HintedObject, IBuffer, IHintedObject, IString } from "../types";
type BigArg = string | number | Big;
type Pub = [string | Key, BigArg] | PubKey;
export declare class Key implements IBuffer, IString {
    private readonly key;
    private readonly suffix;
    readonly type: KeyPairType;
    readonly isPriv: boolean;
    constructor(s: string);
    static from(s: string | Key): Key;
    get noSuffix(): string;
    toBuffer(): Buffer;
    toString(): string;
}
export declare class PubKey extends Key implements IHintedObject {
    private static hint;
    readonly weight: Big;
    constructor(key: string | Key, weight: number | string | Big);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export declare class Keys implements IBuffer, IHintedObject {
    private static hint;
    private readonly _keys;
    readonly threshold: Big;
    constructor(keys: Pub[], threshold: BigArg);
    get keys(): PubKey[];
    get checksum(): Address;
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export {};
