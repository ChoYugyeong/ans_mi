import { Big } from "../types";
declare function getBlocks(api: string | undefined, delegateIP: string | undefined, limit?: number, offset?: number, reverse?: true): Promise<import("axios").AxiosResponse<any, any>>;
declare function getBlockByHeight(api: string | undefined, height: string | number | Big, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getBlockByHash(api: string | undefined, hash: string, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare const _default: {
    getBlocks: typeof getBlocks;
    getBlockByHeight: typeof getBlockByHeight;
    getBlockByHash: typeof getBlockByHash;
};
export default _default;
