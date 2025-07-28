import { Item } from "../base";
import { Amount } from "../../common";
import { HintedObject } from "../../types";
export declare abstract class CurrencyItem extends Item {
    readonly amounts: Amount[];
    protected constructor(hint: string, amounts: Amount[]);
    toHintedObject(): HintedObject;
}
