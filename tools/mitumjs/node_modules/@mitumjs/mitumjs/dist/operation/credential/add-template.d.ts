/// <reference types="node" />
import { ContractFact, FactJson } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { Bool, ShortDate } from "../../types";
export declare class AddTemplateFact extends ContractFact {
    readonly templateID: string;
    readonly templateName: string;
    readonly serviceDate: ShortDate;
    readonly expirationDate: ShortDate;
    readonly templateShare: Bool;
    readonly multiAudit: Bool;
    readonly displayName: string;
    readonly subjectKey: string;
    readonly description: string;
    readonly creator: Address;
    constructor(token: string, sender: string | Address, contract: string | Address, templateID: string, templateName: string, serviceDate: string | ShortDate, expirationDate: string | ShortDate, templateShare: boolean | Bool, multiAudit: boolean | Bool, displayName: string, subjectKey: string, description: string, creator: string | Address, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    get operationHint(): string;
}
