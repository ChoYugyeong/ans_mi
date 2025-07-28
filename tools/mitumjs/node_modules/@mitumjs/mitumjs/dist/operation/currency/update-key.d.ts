/// <reference types="node" />
import { Fact, FactJson } from "../base";
import { CurrencyID } from "../../common";
import { Address, Keys } from "../../key";
export declare class UpdateKeyFact extends Fact {
    readonly sender: Address;
    readonly keys: Keys;
    readonly currency: CurrencyID;
    constructor(token: string, sender: string | Address, keys: Keys, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    get operationHint(): string;
}
