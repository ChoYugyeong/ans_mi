import { Address } from "../../key";
declare function getService(api: string | undefined, contract: string | Address, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getPartitions(api: string | undefined, contract: string | Address, holder: string | Address, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getBalanceByHolder(api: string | undefined, contract: string | Address, holder: string | Address, partition: string, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getOperatorsByHolder(api: string | undefined, contract: string | Address, holder: string | Address, partition: string, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getPartitionBalance(api: string | undefined, contract: string | Address, partition: string, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getAuthorized(api: string | undefined, contract: string | Address, operator: string | Address, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare const _default: {
    getService: typeof getService;
    getPartitions: typeof getPartitions;
    getBalanceByHolder: typeof getBalanceByHolder;
    getOperatorsByHolder: typeof getOperatorsByHolder;
    getPartitionBalance: typeof getPartitionBalance;
    getAuthorized: typeof getAuthorized;
};
export default _default;
