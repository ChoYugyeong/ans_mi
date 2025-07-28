/// <reference types="node" />
import { DAOFact } from "./fact";
import { FactJson } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { BizProposal, CryptoProposal } from "./proposal";
export declare class ProposeFact extends DAOFact {
    readonly proposal: CryptoProposal | BizProposal;
    constructor(token: string, sender: string | Address, contract: string | Address, proposalID: string, proposal: CryptoProposal | BizProposal, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    get operationHint(): string;
}
