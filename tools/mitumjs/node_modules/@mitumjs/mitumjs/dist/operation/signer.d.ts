import { OperationJson, SignOption, Operation as OP, Fact } from "./base";
import { Key } from "../key";
import { Generator, HintedObject, IP } from "../types";
export declare class Signer extends Generator {
    constructor(networkID: string, api?: string | IP);
    /**
     * Sign the given operation in JSON format using given private key.
     * @param {string | Key} [privatekey] - The private key used for signing.
     * @param {Operation<Fact> | HintedObject} [operation] - The operation to be signed.
     * @param {SignOption} [option] - (Optional) Option for node sign.
     * @returns The signed operation in JSON object (HintedObject).
     */
    sign(privatekey: string | Key, operation: OP<Fact> | HintedObject, option?: SignOption): OperationJson;
    private accSign;
    private nodeSign;
    private FillUserOpHash;
    private validateUserOpFields;
}
