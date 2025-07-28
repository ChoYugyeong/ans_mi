import { Address } from "../../key";
declare function getModel(api: string | undefined, contract: string | Address, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getCredential(api: string | undefined, contract: string | Address, templateID: string, credentialID: string, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getTemplate(api: string | undefined, contract: string | Address, templateID: string, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getCredentials(api: string | undefined, contract: string | Address, templateID: string, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getCredentialByHolder(api: string | undefined, contract: string | Address, holder: string | Address, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare const _default: {
    getModel: typeof getModel;
    getCredential: typeof getCredential;
    getTemplate: typeof getTemplate;
    getCredentials: typeof getCredentials;
    getCredentialByHolder: typeof getCredentialByHolder;
};
export default _default;
