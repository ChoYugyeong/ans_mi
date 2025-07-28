/// <reference types="node" />
import { NFTItem } from "./item";
import { Signers } from "./signer";
import { OperationFact } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { HintedObject, LongString } from "../../types";
export declare class MintItem extends NFTItem {
    readonly receiver: Address;
    readonly hash: LongString;
    readonly uri: LongString;
    readonly creators: Signers;
    constructor(contract: string | Address, receiver: string | Address, hash: string | LongString, uri: string | LongString, creators: Signers, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export declare class MintFact extends OperationFact<MintItem> {
    constructor(token: string, sender: string | Address, items: MintItem[]);
    get operationHint(): string;
}
