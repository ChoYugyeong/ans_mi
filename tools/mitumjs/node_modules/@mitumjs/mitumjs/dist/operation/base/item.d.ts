/// <reference types="node" />
import { HintedObject, IBuffer, IHintedObject, IString } from "../../types";
export declare abstract class Item implements IBuffer, IString, IHintedObject {
    private hint;
    protected constructor(hint: string);
    abstract toBuffer(): Buffer;
    abstract toString(): string;
    toHintedObject(): HintedObject;
}
