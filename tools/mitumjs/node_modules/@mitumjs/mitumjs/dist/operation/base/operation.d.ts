/// <reference types="node" />
import { Fact } from "./fact";
import { SignOption } from "./types";
import { GeneralFactSign, NodeFactSign } from "./factsign";
import { Hint } from "../../common";
import { Key } from "../../key";
import { HintedObject, IBuffer, IHintedObject } from "../../types";
type FactSign = GeneralFactSign | NodeFactSign;
type SigType = "FactSign" | "NodeFactSign" | null;
export declare class Operation<T extends Fact> implements IBuffer, IHintedObject {
    readonly id: string;
    readonly hint: Hint;
    readonly fact: T;
    protected _factSigns: FactSign[];
    protected _hash: Buffer;
    constructor(networkID: string, fact: T);
    setFactSigns(factSigns: FactSign[]): void;
    get factSigns(): FactSign[];
    get hash(): Buffer;
    get factSignType(): SigType;
    private getSigType;
    hashing(force?: "force"): Buffer;
    sign(privateKey: string | Key, option?: SignOption): void;
    private signWithSigType;
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export {};
