import { Address } from "../key";
import { SuccessResponse } from "../types";
export declare const calculateAllowance: (response: SuccessResponse, owner: string | Address, approved: string | Address) => {
    amount: string;
};
export declare const convertToArray: (contracts: string | Address | string[] | Address[], length: number) => string[] | Address[];
