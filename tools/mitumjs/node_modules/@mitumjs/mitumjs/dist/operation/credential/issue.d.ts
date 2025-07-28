/// <reference types="node" />
import { OperationFact } from "../base";
import { CredentialItem } from "./item";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { Big, HintedObject } from "../../types";
export declare class IssueItem extends CredentialItem {
    readonly value: string;
    readonly validFrom: Big;
    readonly validUntil: Big;
    readonly did: string;
    constructor(contract: string | Address, holder: string | Address, templateID: string, credentialID: string, value: string, validFrom: string | number | Big, validUntil: string | number | Big, did: string, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class IssueFact extends OperationFact<IssueItem> {
    constructor(token: string, sender: string | Address, items: IssueItem[]);
    get operationHint(): string;
}
