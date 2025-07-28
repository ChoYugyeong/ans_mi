/// <reference types="node" />
import { OperationFact } from "../base";
import { CredentialItem } from "./item";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
export declare class RevokeItem extends CredentialItem {
    constructor(contract: string | Address, holder: string | Address, templateID: string, credentialID: string, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toString(): string;
}
export declare class RevokeFact extends OperationFact<RevokeItem> {
    constructor(token: string, sender: string | Address, items: RevokeItem[]);
    get operationHint(): string;
}
