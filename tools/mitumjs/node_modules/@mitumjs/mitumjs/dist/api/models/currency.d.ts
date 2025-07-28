import { CurrencyID } from "../../common";
declare function getCurrencies(api: string | undefined, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getCurrency(api: string | undefined, currency: string | CurrencyID, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare const _default: {
    getCurrencies: typeof getCurrencies;
    getCurrency: typeof getCurrency;
};
export default _default;
