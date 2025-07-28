import { Address } from "../../key";
declare function getModel(api: string | undefined, contract: string | Address, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getProposal(api: string | undefined, contract: string | Address, proposalID: string, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getApproved(api: string | undefined, contract: string | Address, proposalID: string, registrant: string | Address, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getVoters(api: string | undefined, contract: string | Address, proposalID: string, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare function getVotingStatus(api: string | undefined, contract: string | Address, proposalID: string, delegateIP: string | undefined): Promise<import("axios").AxiosResponse<any, any>>;
declare const _default: {
    getModel: typeof getModel;
    getProposal: typeof getProposal;
    getApproved: typeof getApproved;
    getVoters: typeof getVoters;
    getVotingStatus: typeof getVotingStatus;
};
export default _default;
