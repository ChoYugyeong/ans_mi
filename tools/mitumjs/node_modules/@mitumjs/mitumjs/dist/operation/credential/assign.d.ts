/// <reference types="node" />
import { OperationFact } from "../base";
import { CredentialItem } from "./item";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { Big, HintedObject } from "../../types";
export declare class AssignItem extends CredentialItem {
    readonly value: string;
    readonly validFrom: Big;
    readonly validUntil: Big;
    readonly did: string;
    constructor(contract: string | Address, holder: string | Address, templateID: string, id: string, value: string, validFrom: string | number | Big, validUntil: string | number | Big, did: string, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class AssignFact extends OperationFact<AssignItem> {
    constructor(token: string, sender: string | Address, items: AssignItem[]);
    get operationHint(): string;
}
