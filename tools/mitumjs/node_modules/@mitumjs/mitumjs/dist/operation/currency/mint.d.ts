/// <reference types="node" />
import { Item, NodeFact, FactJson } from "../base";
import { Address } from "../../key";
import { Amount } from "../../common";
import { HintedObject } from "../../types";
export declare class MintItem extends Item {
    readonly amount: Amount;
    readonly receiver: Address;
    constructor(receiver: string | Address, amount: Amount);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class MintFact extends NodeFact {
    readonly items: MintItem[];
    constructor(token: string, items: MintItem[]);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    get operationHint(): string;
}
