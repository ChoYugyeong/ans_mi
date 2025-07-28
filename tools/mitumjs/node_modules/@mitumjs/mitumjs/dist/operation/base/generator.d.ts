import { Generator, IP } from "../../types";
export declare abstract class ContractGenerator extends Generator {
    protected constructor(networkID: string, api?: string | IP, delegateIP?: string | IP);
}
