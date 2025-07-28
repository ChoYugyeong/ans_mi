/// <reference types="node" />
import { DAOFact } from "./fact";
import { FactJson } from "../base";
import { Big } from "../../types";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
export declare class VoteFact extends DAOFact {
    readonly vote: Big;
    constructor(token: string, sender: string | Address, contract: string | Address, proposalID: string, vote: string | number | Big, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    get operationHint(): string;
}
