/// <reference types="node" />
import { ContractFact, FactJson } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { LongString } from "../../types";
export declare abstract class PrescriptionFact extends ContractFact {
    readonly prescriptionHash: LongString;
    protected constructor(hint: string, token: string, sender: string | Address, contract: string | Address, prescriptionHash: string | LongString, currency: string | CurrencyID);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
}
