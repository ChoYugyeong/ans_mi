/// <reference types="node" />
import { ContractFact, FactJson } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { DAOPolicy } from "./policy";
export declare class UpdateModelConfigFact extends ContractFact {
    readonly option: "crypto" | "biz";
    readonly policy: DAOPolicy;
    constructor(token: string, sender: string | Address, contract: string | Address, option: "crypto" | "biz", policy: DAOPolicy, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    get operationHint(): string;
}
