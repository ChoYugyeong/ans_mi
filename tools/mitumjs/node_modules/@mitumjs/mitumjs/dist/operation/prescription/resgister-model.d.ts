/// <reference types="node" />
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { ContractFact, FactJson } from "../base";
export declare class RegisterModelFact extends ContractFact {
    constructor(token: string, sender: string | Address, contract: string | Address, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    get operationHint(): string;
}
