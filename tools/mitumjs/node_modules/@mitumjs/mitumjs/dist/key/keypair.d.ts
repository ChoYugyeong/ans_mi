/// <reference types="node" />
import { HDNodeWallet } from "ethers";
import { Key } from "./pub";
import { HDAccount, KeyPairType } from "./types";
interface IKeyGenerator {
    random(option?: KeyPairType): BaseKeyPair;
    fromPrivateKey(key: string | Key): BaseKeyPair;
    fromSeed(seed: string | Buffer | Uint8Array, option?: KeyPairType): BaseKeyPair;
    hdRandom(option?: KeyPairType): HDAccount;
    fromPhrase(phrase: string, path?: string, option?: KeyPairType): HDAccount;
}
export declare abstract class BaseKeyPair {
    readonly privateKey: Key;
    readonly publicKey: Key;
    protected signer: Uint8Array;
    protected static generator: IKeyGenerator;
    protected constructor(privateKey: Key);
    abstract sign(msg: string | Buffer): Buffer;
    abstract verify(sig: string | Buffer, msg: string | Buffer): boolean;
    protected abstract getSigner(): Uint8Array;
    protected abstract getPub(): Key;
    static random<T extends BaseKeyPair>(option?: KeyPairType): T;
    static fromSeed<T extends BaseKeyPair>(seed: string | Buffer | Uint8Array, option?: KeyPairType): T;
    static fromPrivateKey<T extends BaseKeyPair>(key: string | Key): T;
    static hdRandom(option?: KeyPairType): HDAccount;
    static fromPhrase(phrase: string, path?: string, option?: KeyPairType): HDAccount;
    protected ethSign(msg: string | Buffer): Buffer;
    protected ethVerify(sig: string | Buffer, msg: string | Buffer): boolean;
    protected static K(seed: string | Buffer | Uint8Array): bigint;
}
export declare class KeyPair extends BaseKeyPair {
    static generator: {
        fillHDAccount(kp: KeyPair, wallet: HDNodeWallet): HDAccount;
        random(): KeyPair;
        fromSeed(seed: string): KeyPair;
        fromPrivateKey(key: string | Key): KeyPair;
        hdRandom(): HDAccount;
        fromPhrase(phrase: string, path?: string): HDAccount;
    };
    private constructor();
    protected getSigner(): Uint8Array;
    protected getPub(): Key;
    sign(msg: string | Buffer): Buffer;
    verify(sig: string | Buffer, msg: string | Buffer): boolean;
}
export {};
