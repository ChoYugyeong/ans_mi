import { Address } from "../../key";
import { Big } from "../../types";
declare function getModel(api: string | undefined, contract: string | Address, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getTimeStamp(api: string | undefined, contract: string | Address, projectID: string, timestampIdx: string | number | Big, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare const _default: {
    getModel: typeof getModel;
    getTimeStamp: typeof getTimeStamp;
};
export default _default;
