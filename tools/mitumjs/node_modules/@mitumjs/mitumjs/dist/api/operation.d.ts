import { Address } from "../key";
import { Big, HintedObject } from "../types";
declare function getOperations(api: string | undefined, delegateIP: string | undefined, limit?: number, offset?: [number, number], reverse?: true): Promise<import("axios").AxiosResponse<any, any>>;
declare function getOperation(api: string | undefined, hash: string, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getMultiOperations(api: string | undefined, hashes: string[], delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getBlockOperationsByHeight(api: string | undefined, height: string | number | Big, delegateIP: string | undefined, limit?: number, offset?: number, reverse?: true): Promise<import("axios").AxiosResponse<any, any>>;
declare function getAccountOperations(api: string | undefined, address: string | Address, delegateIP: string | undefined, limit?: number, offset?: [number, number], reverse?: true): Promise<import("axios").AxiosResponse<any, any>>;
declare function send(api: string | undefined, operation: HintedObject | string, delegateIP: string | undefined, config?: {
    [i: string]: any;
}): Promise<import("axios").AxiosResponse<any, any>>;
declare const _default: {
    getOperations: typeof getOperations;
    getOperation: typeof getOperation;
    getBlockOperationsByHeight: typeof getBlockOperationsByHeight;
    getMultiOperations: typeof getMultiOperations;
    getAccountOperations: typeof getAccountOperations;
    send: typeof send;
};
export default _default;
