/// <reference types="node" />
import { FactJson } from "../base";
import { PrescriptionFact } from "./fact";
import { Big, LongString } from "../../types";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
export declare class UsePrescriptionFact extends PrescriptionFact {
    readonly prepareDate: Big;
    readonly pharmacy: LongString;
    constructor(token: string, sender: string | Address, contract: string | Address, prescriptionHash: string | LongString, prepareDate: string | number | Big, pharmacy: string | LongString, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    get operationHint(): string;
}
