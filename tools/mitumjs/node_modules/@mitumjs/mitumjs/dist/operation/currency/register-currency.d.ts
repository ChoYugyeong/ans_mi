/// <reference types="node" />
import { CurrencyDesign } from "./currency-design";
import { NodeFact, FactJson } from "../base";
export declare class RegisterCurrencyFact extends NodeFact {
    readonly design: CurrencyDesign;
    constructor(token: string, design: CurrencyDesign);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    get operationHint(): string;
}
