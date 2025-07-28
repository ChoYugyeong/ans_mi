/// <reference types="node" />
import { DAOFact } from "./fact";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
export declare class PostSnapFact extends DAOFact {
    constructor(token: string, sender: string | Address, contract: string | Address, proposalID: string, currency: string | CurrencyID);
    toBuffer(): Buffer;
    get operationHint(): string;
}
