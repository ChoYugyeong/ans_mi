/// <reference types="node" />
import { ContractFact, FactJson } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { Big, LongString } from "../../types";
export declare class UpdateCollectionPolicyFact extends ContractFact {
    readonly name: LongString;
    readonly royalty: Big;
    readonly uri: LongString;
    readonly whitelist: Address[];
    constructor(token: string, sender: string | Address, contract: string | Address, name: string | LongString, royalty: string | number | Big, uri: string | LongString, whitelist: (string | Address)[] | null, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    get operationHint(): string;
}
