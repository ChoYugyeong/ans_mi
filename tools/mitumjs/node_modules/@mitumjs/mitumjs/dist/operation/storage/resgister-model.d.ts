/// <reference types="node" />
import { Address } from "../../key";
import { LongString } from "../../types";
import { CurrencyID } from "../../common";
import { ContractFact, FactJson } from "../base";
export declare class RegisterModelFact extends ContractFact {
    readonly project: LongString;
    constructor(token: string, sender: string | Address, contract: string | Address, project: string | LongString, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    get operationHint(): string;
}
