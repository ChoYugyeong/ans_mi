/// <reference types="node" />
import { CurrencyPolicy } from "./currency-design";
import { FactJson, NodeFact } from "../base";
import { CurrencyID } from "../../common";
export declare class UpdateCurrencyFact extends NodeFact {
    readonly currency: CurrencyID;
    readonly policy: CurrencyPolicy;
    constructor(token: string, currency: string | CurrencyID, policy: CurrencyPolicy);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    get operationHint(): string;
}
