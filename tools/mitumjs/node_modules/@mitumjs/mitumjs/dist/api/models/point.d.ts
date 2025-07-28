import { Address } from "../../key";
declare function getModel(api: string | undefined, contract: string | Address, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getPointBalance(api: string | undefined, contract: string | Address, account: string | Address, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare const _default: {
    getModel: typeof getModel;
    getPointBalance: typeof getPointBalance;
};
export default _default;
