/// <reference types="node" />
import { TimeStampFact } from "./fact";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
export declare class RegisterModelFact extends TimeStampFact {
    constructor(token: string, sender: string | Address, contract: string | Address, currency: string | CurrencyID);
    toBuffer(): Buffer;
    get operationHint(): string;
}
