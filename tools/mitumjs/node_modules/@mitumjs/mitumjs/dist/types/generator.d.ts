import { IP } from "./string";
export declare abstract class Generator {
    protected _networkID: string;
    protected _api: IP | undefined;
    protected _delegateIP: IP | undefined;
    protected constructor(networkID: string, api?: string | IP, delegateIP?: string | IP);
    protected setNetworkID(networkID: string): void;
    protected setAPI(api?: string | IP): void;
    protected setDelegate(delegateIP?: string | IP): void;
    protected get networkID(): string;
    protected get api(): string | undefined;
    protected get delegateIP(): string | undefined;
}
