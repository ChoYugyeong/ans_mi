import { AxiosResponse } from "axios";
import account from "./account";
import block from "./block";
import node from "./node";
import operation from "./operation";
import { SuccessResponse, ErrorResponse } from "../types";
declare const currency: {
    getCurrencies: (api: string | undefined, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
    getCurrency: (api: string | undefined, currency: string | import("../common").CurrencyID, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
};
declare const contractApi: {
    nft: {
        getNFT: (api: string | undefined, contract: string | import("../key").Address, nftIdx: string | number | import("../types").Big, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getNFTs: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined, factHash?: string | undefined, limit?: number | undefined, offset?: number | undefined, reverse?: true | undefined) => Promise<AxiosResponse<any, any>>;
        getNFTCount: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getModel: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getAccountOperators: (api: string | undefined, contract: string | import("../key").Address, account: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
    };
    credential: {
        getModel: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getCredential: (api: string | undefined, contract: string | import("../key").Address, templateID: string, credentialID: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getTemplate: (api: string | undefined, contract: string | import("../key").Address, templateID: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getCredentials: (api: string | undefined, contract: string | import("../key").Address, templateID: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getCredentialByHolder: (api: string | undefined, contract: string | import("../key").Address, holder: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
    };
    dao: {
        getModel: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getProposal: (api: string | undefined, contract: string | import("../key").Address, proposalID: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getApproved: (api: string | undefined, contract: string | import("../key").Address, proposalID: string, registrant: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getVoters: (api: string | undefined, contract: string | import("../key").Address, proposalID: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getVotingStatus: (api: string | undefined, contract: string | import("../key").Address, proposalID: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
    };
    kyc: {};
    sto: {
        getService: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getPartitions: (api: string | undefined, contract: string | import("../key").Address, holder: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getBalanceByHolder: (api: string | undefined, contract: string | import("../key").Address, holder: string | import("../key").Address, partition: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getOperatorsByHolder: (api: string | undefined, contract: string | import("../key").Address, holder: string | import("../key").Address, partition: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getPartitionBalance: (api: string | undefined, contract: string | import("../key").Address, partition: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getAuthorized: (api: string | undefined, contract: string | import("../key").Address, operator: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
    };
    timestamp: {
        getModel: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getTimeStamp: (api: string | undefined, contract: string | import("../key").Address, projectID: string, timestampIdx: string | number | import("../types").Big, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
    };
    token: {
        getModel: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getTokenBalance: (api: string | undefined, contract: string | import("../key").Address, account: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
    };
    point: {
        getModel: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getPointBalance: (api: string | undefined, contract: string | import("../key").Address, account: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
    };
    storage: {
        getModel: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getData: (api: string | undefined, contract: string | import("../key").Address, dataKey: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getDataHistory: (api: string | undefined, contract: string | import("../key").Address, dataKey: string, delegateIP: string | undefined, limit?: number | undefined, offset?: number | undefined, reverse?: true | undefined) => Promise<AxiosResponse<any, any>>;
        getDataCount: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined, deleted?: true | undefined) => Promise<AxiosResponse<any, any>>;
    };
    payment: {
        getAccountInfo: (api: string | undefined, contract: string | import("../key").Address, address: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getModel: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
    };
};
export { account, block, node, operation, currency, contractApi, };
declare const _default: {
    account: {
        getAccount: (api: string | undefined, address: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getAccountByPublicKey: (api: string | undefined, publicKey: string | import("../key").Key, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
    };
    block: {
        getBlocks: (api: string | undefined, delegateIP: string | undefined, limit?: number | undefined, offset?: number | undefined, reverse?: true | undefined) => Promise<AxiosResponse<any, any>>;
        getBlockByHeight: (api: string | undefined, height: string | number | import("../types").Big, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getBlockByHash: (api: string | undefined, hash: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
    };
    node: {
        getNode: (api: string | undefined, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
    };
    operation: {
        getOperations: (api: string | undefined, delegateIP: string | undefined, limit?: number | undefined, offset?: [number, number] | undefined, reverse?: true | undefined) => Promise<AxiosResponse<any, any>>;
        getOperation: (api: string | undefined, hash: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getBlockOperationsByHeight: (api: string | undefined, height: string | number | import("../types").Big, delegateIP: string | undefined, limit?: number | undefined, offset?: number | undefined, reverse?: true | undefined) => Promise<AxiosResponse<any, any>>;
        getMultiOperations: (api: string | undefined, hashes: string[], delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getAccountOperations: (api: string | undefined, address: string | import("../key").Address, delegateIP: string | undefined, limit?: number | undefined, offset?: [number, number] | undefined, reverse?: true | undefined) => Promise<AxiosResponse<any, any>>;
        send: (api: string | undefined, operation: string | import("../types").HintedObject, delegateIP: string | undefined, config?: {
            [i: string]: any;
        } | undefined) => Promise<AxiosResponse<any, any>>;
    };
    currency: {
        getCurrencies: (api: string | undefined, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        getCurrency: (api: string | undefined, currency: string | import("../common").CurrencyID, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
    };
    contractApi: {
        nft: {
            getNFT: (api: string | undefined, contract: string | import("../key").Address, nftIdx: string | number | import("../types").Big, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getNFTs: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined, factHash?: string | undefined, limit?: number | undefined, offset?: number | undefined, reverse?: true | undefined) => Promise<AxiosResponse<any, any>>;
            getNFTCount: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getModel: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getAccountOperators: (api: string | undefined, contract: string | import("../key").Address, account: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        };
        credential: {
            getModel: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getCredential: (api: string | undefined, contract: string | import("../key").Address, templateID: string, credentialID: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getTemplate: (api: string | undefined, contract: string | import("../key").Address, templateID: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getCredentials: (api: string | undefined, contract: string | import("../key").Address, templateID: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getCredentialByHolder: (api: string | undefined, contract: string | import("../key").Address, holder: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        };
        dao: {
            getModel: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getProposal: (api: string | undefined, contract: string | import("../key").Address, proposalID: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getApproved: (api: string | undefined, contract: string | import("../key").Address, proposalID: string, registrant: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getVoters: (api: string | undefined, contract: string | import("../key").Address, proposalID: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getVotingStatus: (api: string | undefined, contract: string | import("../key").Address, proposalID: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        };
        kyc: {};
        sto: {
            getService: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getPartitions: (api: string | undefined, contract: string | import("../key").Address, holder: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getBalanceByHolder: (api: string | undefined, contract: string | import("../key").Address, holder: string | import("../key").Address, partition: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getOperatorsByHolder: (api: string | undefined, contract: string | import("../key").Address, holder: string | import("../key").Address, partition: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getPartitionBalance: (api: string | undefined, contract: string | import("../key").Address, partition: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getAuthorized: (api: string | undefined, contract: string | import("../key").Address, operator: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        };
        timestamp: {
            getModel: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getTimeStamp: (api: string | undefined, contract: string | import("../key").Address, projectID: string, timestampIdx: string | number | import("../types").Big, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        };
        token: {
            getModel: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getTokenBalance: (api: string | undefined, contract: string | import("../key").Address, account: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        };
        point: {
            getModel: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getPointBalance: (api: string | undefined, contract: string | import("../key").Address, account: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        };
        storage: {
            getModel: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getData: (api: string | undefined, contract: string | import("../key").Address, dataKey: string, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getDataHistory: (api: string | undefined, contract: string | import("../key").Address, dataKey: string, delegateIP: string | undefined, limit?: number | undefined, offset?: number | undefined, reverse?: true | undefined) => Promise<AxiosResponse<any, any>>;
            getDataCount: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined, deleted?: true | undefined) => Promise<AxiosResponse<any, any>>;
        };
        payment: {
            getAccountInfo: (api: string | undefined, contract: string | import("../key").Address, address: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
            getModel: (api: string | undefined, contract: string | import("../key").Address, delegateIP: string | undefined) => Promise<AxiosResponse<any, any>>;
        };
    };
};
export default _default;
export declare function getAPIData(f: () => Promise<AxiosResponse>, _links?: boolean): Promise<SuccessResponse | ErrorResponse>;
