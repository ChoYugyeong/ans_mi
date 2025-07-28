/// <reference types="node" />
import { PointFact } from "./fact";
import { FactJson } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { Big, LongString } from "../../types";
export declare class RegisterPointFact extends PointFact {
    readonly symbol: CurrencyID;
    readonly name: LongString;
    readonly initialSupply: Big;
    constructor(token: string, sender: string | Address, contract: string | Address, currency: string | CurrencyID, symbol: string | CurrencyID, name: string | LongString, initialSupply: string | number | Big);
    toBuffer(): Buffer;
    toHintedObject(): FactJson;
    get operationHint(): string;
}
