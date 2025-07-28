/// <reference types="node" />
import { ContractFact, FactJson } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
export declare abstract class DAOFact extends ContractFact {
    readonly proposalID: string;
    protected constructor(hint: string, token: string, sender: string | Address, contract: string | Address, proposalID: string, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
}
