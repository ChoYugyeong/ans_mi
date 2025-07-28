/// <reference types="node" />
import { Item } from "./item";
import { FactJson } from "./types";
import { Address } from "../../key";
import { IBuffer, IHintedObject } from "../../types";
import { CurrencyID, Token } from "../../common";
export declare abstract class Fact implements IBuffer, IHintedObject {
    private hint;
    readonly token: Token;
    protected _hash: Buffer;
    readonly items?: Item[];
    protected constructor(hint: string, token: string);
    get hash(): Buffer;
    hashing(): Buffer;
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    abstract get operationHint(): string;
}
export declare abstract class OperationFact<T extends Item> extends Fact {
    readonly sender: Address;
    readonly items: T[];
    protected constructor(hint: string, token: string, sender: string | Address, items: T[]);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
}
export declare abstract class ContractFact extends Fact {
    readonly sender: Address;
    readonly contract: Address;
    readonly currency: CurrencyID;
    protected constructor(hint: string, token: string, sender: string | Address, contract: string | Address, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
}
export declare abstract class NodeFact extends Fact {
    protected constructor(hint: string, token: string);
}
