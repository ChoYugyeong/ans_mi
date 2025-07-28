import { KeyPairType } from "./types";
import { Keys } from "./pub";
import { BaseKeyPair } from "./keypair";
export declare const randomN: (n: number, option?: KeyPairType) => {
    keys: Keys;
    keypairs: BaseKeyPair[];
};
