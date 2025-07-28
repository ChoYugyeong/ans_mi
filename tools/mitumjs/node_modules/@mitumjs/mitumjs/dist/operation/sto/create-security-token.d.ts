/// <reference types="node" />
import { STOItem } from "./item";
import { Partition } from "./partition";
import { OperationFact } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { Big, HintedObject } from "../../types";
export declare class CreateSecurityTokenItem extends STOItem {
    readonly granularity: Big;
    readonly defaultPartition: Partition;
    constructor(contract: string | Address, granularity: string | number | Big, defaultPartition: string | Partition, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
    toString(): string;
}
export declare class CreateSecurityTokenFact extends OperationFact<CreateSecurityTokenItem> {
    constructor(token: string, sender: string | Address, items: CreateSecurityTokenItem[]);
    get operationHint(): string;
}
