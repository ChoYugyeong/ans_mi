/// <reference types="node" />
import { ContractFact, FactJson } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
export declare abstract class TokenFact extends ContractFact {
    protected constructor(hint: string, token: string, sender: string | Address, contract: string | Address, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
}
