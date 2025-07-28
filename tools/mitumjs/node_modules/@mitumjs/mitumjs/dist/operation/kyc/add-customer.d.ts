/// <reference types="node" />
import { KYCItem } from "./item";
import { OperationFact } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { Bool, HintedObject } from "../../types";
export declare class AddCustomerItem extends KYCItem {
    readonly customer: Address;
    readonly status: Bool;
    constructor(contract: string | Address, customer: string | Address, status: boolean | Bool, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class AddCustomerFact extends OperationFact<AddCustomerItem> {
    constructor(token: string, sender: string | Address, items: AddCustomerItem[]);
    get operationHint(): string;
}
