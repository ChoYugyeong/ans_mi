/// <reference types="node" />
import { FactJson } from "../base";
import { PaymentFact } from "./fact";
import { Big } from "../../types";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
export declare class UpdateFact extends PaymentFact {
    readonly transfer_limit: Big;
    readonly start_time: Big;
    readonly end_time: Big;
    readonly duration: Big;
    constructor(token: string, sender: string | Address, contract: string | Address, currency: string | CurrencyID, transfer_limit: string | number, start_time: string | number, end_time: string | number, duration: string | number);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    get operationHint(): string;
}
