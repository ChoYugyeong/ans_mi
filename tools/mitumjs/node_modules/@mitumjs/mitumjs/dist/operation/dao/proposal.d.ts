/// <reference types="node" />
import { DAOPolicy } from "./policy";
import { Address } from "../../key";
import { Amount } from "../../common";
import { Big, HintedObject, IBuffer, IHintedObject, LongString } from "../../types";
declare abstract class Calldata implements IBuffer, IHintedObject {
    private hint;
    constructor(hint: string);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export declare class TransferCalldata extends Calldata {
    readonly sender: Address;
    readonly receiver: Address;
    readonly amount: Amount;
    constructor(sender: string | Address, receiver: string | Address, amount: Amount);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export declare class GovernanceCalldata extends Calldata {
    readonly policy: DAOPolicy;
    constructor(policy: DAOPolicy);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
declare abstract class Proposal implements IBuffer, IHintedObject {
    private hint;
    readonly proposer: Address;
    readonly startTime: Big;
    constructor(hint: string, proposer: string | Address, startTime: string | number | Big);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export declare class CryptoProposal extends Proposal {
    readonly calldata: TransferCalldata | GovernanceCalldata;
    constructor(proposer: string | Address, startTime: string | number | Big, calldata: TransferCalldata | GovernanceCalldata);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export declare class BizProposal extends Proposal {
    readonly url: LongString;
    readonly hash: LongString;
    readonly options: Big;
    constructor(proposer: string | Address, startTime: string | number | Big, url: string | LongString, hash: string | LongString, options: string | number | Big);
    toBuffer(): Buffer;
    toHintedObject(): HintedObject;
}
export {};
