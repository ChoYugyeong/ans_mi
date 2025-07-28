import { Address, Key } from "../key";
declare function getAccount(api: string | undefined, address: string | Address, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getAccountByPublicKey(api: string | undefined, publicKey: string | Key, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare const _default: {
    getAccount: typeof getAccount;
    getAccountByPublicKey: typeof getAccountByPublicKey;
};
export default _default;
