import { Address } from "../../key";
import { HintedObject, IHintedObject } from "../../types";
export declare class Authentication implements IHintedObject {
    readonly contract: Address;
    readonly authenticationId: string;
    readonly proofData: string;
    private hint;
    constructor(contract: string | Address, authenticationId: string, proofData: string | undefined);
    toHintedObject(): HintedObject;
}
export declare class ProxyPayer implements IHintedObject {
    readonly proxyPayer: Address;
    private hint;
    constructor(proxyPayer: string | Address);
    toHintedObject(): HintedObject;
}
export declare class Settlement implements IHintedObject {
    readonly opSender: Address | "";
    private hint;
    constructor(opSender: string | Address | undefined);
    toHintedObject(): HintedObject;
}
