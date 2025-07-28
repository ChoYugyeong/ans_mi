import { CreateServiceFact } from "./create-service";
import { AddControllerFact } from "./add-controller";
import { RemoveControllerFact } from "./remove-controller";
import { AddCustomerFact } from "./add-customer";
import { UpdateCustomerFact } from "./update-customer";
import { ContractGenerator, Operation } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { Bool, IP } from "../../types";
export declare class KYC extends ContractGenerator {
    constructor(networkID: string, api?: string | IP, delegateIP?: string | IP);
    createService(contract: string | Address, sender: string | Address, currency: string | CurrencyID): Operation<CreateServiceFact>;
    addController(contract: string | Address, sender: string | Address, controller: string | Address, currency: string | CurrencyID): Operation<AddControllerFact>;
    addCustomer(contract: string | Address, sender: string | Address, customer: string | Address, status: boolean | Bool, currency: string | CurrencyID): Operation<AddCustomerFact>;
    removeController(contract: string | Address, sender: string | Address, controller: string | Address, currency: string | CurrencyID): Operation<RemoveControllerFact>;
    updateCustomer(contract: string | Address, sender: string | Address, customer: string | Address, status: boolean | Bool, currency: string | CurrencyID): Operation<UpdateCustomerFact>;
}
