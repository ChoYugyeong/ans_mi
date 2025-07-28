import { ErrorCode } from "./code";
import { RangeConfig } from "../node";
export declare class MitumError extends Error {
    readonly code: ErrorCode;
    private constructor();
    static new(): MitumError;
    static detail(code?: ErrorCode, msg?: string): MitumError;
}
export declare class Assert {
    private condition;
    private error;
    private constructor();
    static get(condition: boolean, error?: MitumError): Assert;
    static check(condition: boolean, error?: MitumError): void;
    not(): this;
    true(): this;
    false(): this;
    excute(): void;
}
export declare class StringAssert {
    private readonly s;
    private condition;
    private error;
    private constructor();
    static with(s: string, error?: MitumError): StringAssert;
    private union;
    not(): this;
    empty(): this;
    equal(s: string): this;
    startsWith(...pre: string[]): this;
    endsWith(...suf: string[]): this;
    satisfyConfig(config: RangeConfig): this;
    chainAnd(...conditions: boolean[]): this;
    chainOr(...conditions: boolean[]): this;
    excute(): void;
}
export declare class ArrayAssert {
    private array;
    private arrayName;
    private validType;
    constructor(array: any[], arrayName: string);
    private validateType;
    notEmpty(): this;
    exactLength(length: number): this;
    rangeLength(rangeConfig: RangeConfig): this;
    maxLength(max: number): this;
    sameLength(array2: any[], arrayName2: string): this;
    noDuplicates(): this;
    static check(array: any[], arrayName: string): ArrayAssert;
}
