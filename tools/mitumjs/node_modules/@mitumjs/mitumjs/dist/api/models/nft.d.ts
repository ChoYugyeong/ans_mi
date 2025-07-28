import { Address } from "../../key";
import { Big } from "../../types";
declare function getNFT(api: string | undefined, contract: string | Address, nftIdx: string | number | Big, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getNFTs(api: string | undefined, contract: string | Address, delegateIP: string | undefined, factHash?: string, limit?: number, offset?: number, reverse?: true): Promise<import("axios").AxiosResponse<any, any>>;
declare function getNFTCount(api: string | undefined, contract: string | Address, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getModel(api: string | undefined, contract: string | Address, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getAccountOperators(api: string | undefined, contract: string | Address, account: string | Address, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare const _default: {
    getNFT: typeof getNFT;
    getNFTs: typeof getNFTs;
    getNFTCount: typeof getNFTCount;
    getModel: typeof getModel;
    getAccountOperators: typeof getAccountOperators;
};
export default _default;
