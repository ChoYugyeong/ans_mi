/// <reference types="node" />
import { ContractFact } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
export declare class CreateServiceFact extends ContractFact {
    constructor(token: string, sender: string | Address, contract: string | Address, currency: string | CurrencyID);
    toBuffer(): Buffer;
    get operationHint(): string;
}
