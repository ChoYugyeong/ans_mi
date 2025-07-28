/// <reference types="node" />
import { FactJson } from "../base";
import { PrescriptionFact } from "./fact";
import { Big, LongString } from "../../types";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
export declare class RegisterPrescriptionFact extends PrescriptionFact {
    readonly prescribeDate: Big;
    readonly endDate: Big;
    readonly hospital: LongString;
    constructor(token: string, sender: string | Address, contract: string | Address, prescriptionHash: string | LongString, prescribeDate: string | number | Big, endDate: string | number | Big, hospital: string | LongString, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    get operationHint(): string;
}
