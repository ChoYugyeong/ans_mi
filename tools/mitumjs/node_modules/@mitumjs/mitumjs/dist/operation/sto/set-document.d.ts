/// <reference types="node" />
import { ContractFact, FactJson } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
export declare class SetDocumentFact extends ContractFact {
    readonly title: string;
    readonly uri: string;
    readonly documentHash: string;
    constructor(token: string, sender: string | Address, contract: string | Address, title: string, uri: string, documentHash: string, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    get operationHint(): string;
}
