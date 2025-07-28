import { Address } from "../../key";
declare function getModel(api: string | undefined, contract: string | Address, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getAccountInfo(api: string | undefined, contract: string | Address, address: string | Address, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare const _default: {
    getAccountInfo: typeof getAccountInfo;
    getModel: typeof getModel;
};
export default _default;
