/// <reference types="node" />
import { FactJson } from "../base";
import { ContractFact } from "../base";
import { Big } from "../../types";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
export declare class IssueFact extends ContractFact {
    readonly projectID: string;
    readonly requestTimeStamp: Big;
    readonly data: string;
    constructor(token: string, sender: string | Address, contract: string | Address, projectID: string, requestTimeStamp: string | number | Big, data: string, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    get operationHint(): string;
}
