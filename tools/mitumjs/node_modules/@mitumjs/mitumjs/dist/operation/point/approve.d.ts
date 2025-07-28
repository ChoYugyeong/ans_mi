/// <reference types="node" />
import { PointFact } from "./fact";
import { Big } from "../../types";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { FactJson } from "../base";
export declare class ApproveFact extends PointFact {
    readonly approved: Address;
    readonly amount: Big;
    constructor(token: string, sender: string | Address, contract: string | Address, currency: string | CurrencyID, approved: string | Address, amount: string | number | Big);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    get operationHint(): string;
}
