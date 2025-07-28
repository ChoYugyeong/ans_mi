import { RegisterModelFact } from "./register-model";
import { AddTemplateFact } from "./add-template";
import { IssueFact } from "./issue";
import { RevokeFact } from "./revoke";
import { ContractGenerator, Operation } from "../base";
import { Address } from "../../key";
import { CurrencyID } from "../../common";
import { Big, Bool, IP, ShortDate } from "../../types";
type templateData = {
    templateID: string;
    templateName: string;
    serviceDate: string | ShortDate;
    expirationDate: string | ShortDate;
    templateShare: boolean | Bool;
    multiAudit: boolean | Bool;
    displayName: string;
    subjectKey: string;
    description: string;
    creator: string | Address;
};
type issueData = {
    holder: string | Address;
    templateID: string;
    credentialID: string;
    value: string;
    validFrom: string | number | Big;
    validUntil: string | number | Big;
    did: string;
};
export declare class Credential extends ContractGenerator {
    constructor(networkID: string, api?: string | IP, delegateIP?: string | IP);
    /**
     * Generate a `register-model` operation to register new credential model on the contract.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `register-model` operation.
     */
    registerModel(contract: string | Address, sender: string | Address, currency: string | CurrencyID): Operation<RegisterModelFact>;
    /**
     * Generate an `add-template` operation for adding a new credential template to the credential service.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {templateData} [data] - The template data to be added. The properties of `templateData` include:
     * - {string} `templateID` - The ID of the template.
     * - {string} `templateName` - The name of the template.
     * - {string | ShortDate} `serviceDate` - The service date.
     * - {string | ShortDate} `expirationDate` - The expiration date.
     * - {boolean | Bool} `templateShare` - Indicates whether the template is shareable.
     * - {boolean | Bool} `multiAudit` - Indicates whether multi-audit is enabled.
     * - {string} `displayName` - The display name of the template.
     * - {string} `subjectKey` - The subject key of the template.
     * - {string} `description` - The description of the template.
     * - {string | Address} `creator` - The address of the creator of the template.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns An `add-template` operation.
     */
    addTemplate(contract: string | Address, sender: string | Address, data: templateData, currency: string | CurrencyID): Operation<AddTemplateFact>;
    /**
     * Generate an `issue` operation for issue credential to holder.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {issueData} [data] - The data required for issuing the credential. The properties of `issueData` include:
     * - {string | Address} `holder` - The address of the credential holder.
     * - {string} `templateID` - The ID of the template.
     * - {string} `credentialID` - The ID of the credential.
     * - {string} `value` - The value of the credential.
     * - {string | number | Big} `validFrom` - The timestamp for validFrom.
     * - {string | number | Big} `validUntil` - The timestamp for validUntil.
     * - {string} `did` - The Decentralized Identifier (DID) associated with the credential.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `issue` operation.
     */
    issue(contract: string | Address, sender: string | Address, data: issueData, currency: string | CurrencyID): Operation<IssueFact>;
    /**
     * Generate an `revoke` operation to revoke already issued credential.
     * @param {string | Address} contract - The contract's address.
     * @param {string | Address} sender - The sender's address.
     * @param {string | Address} holder - The holder's address of the credential to be revoked.
     * @param {string} templateID - The ID of the template associated with the credential.
     * @param {string} credentialID - The ID of the credential to be revoked.
     * @param {string | CurrencyID} currency - The currency ID.
     * @returns `revoke` operation.
     */
    revoke(contract: string | Address, sender: string | Address, holder: string | Address, templateID: string, credentialID: string, currency: string | CurrencyID): Operation<RevokeFact>;
    /**
     * Get information about a credential model on the contract.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @returns `data` of `SuccessResponse` is credential service information:
     * - `_hint`: Hint for credential design,
     * - `policy`:
     * - - `_hint`: Hint for credential policy,
     * - - `templates`: Array of name of templates,
     * - - `holders`: Array of holder object
     * - - - `_hint`: Hint for holder,
     * - - - `address`: Address of holder,
     * - - - `credential_count`: The number of credential for the holder
     * - - `credential_count`: The total number of credential
     */
    getModelInfo(contract: string | Address): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
    /**
     * Get detailed information about a specific credential on the template.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string} [templateID] - The ID of the template associated with the credential.
     * @param {string} [credentialID] - The unique ID of the credential.
     * @returns `data` of `SuccessResponse` is credential information:
     * - `credential`:
     * - - `_hint`: Hint for credential,
     * - - `holder`: Address of holder,
     * - - `template_id`: The id for the template,
     * - - `credential_id`: The id for the credential,
     * - - `value`: The value of credential,
     * - - `valid_from`: The timestamp for valid_from,
     * - - `valid_until`: The timestamp for valid_until,
     * - - `did`: The name of the credential,
     * - `is_active`: Indicates whether the credential is active or revoked
     */
    getCredential(contract: string | Address, templateID: string, credentialID: string): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
    /**
     * Get information about a specific template on the credential service.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string} [templateID] - The ID of the template.
     * @returns `data` of `SuccessResponse` is template information:
     * - `_hint`: Hint for credential template,
     * - `template_id`: The ID of the template.- `template_name`: Name for template,
     * - `service_date`: The service date.
     * - `expiration_date`: The expiration date.
     * - `template_share`: Indicates whether the template is shareable.
     * - `multi_audit`: Indicates whether multi-audit is enabled.
     * - `display_name`: The display name of the template.
     * - `subject_key`: The description of the template.
     * - `description`: The description of the template.
     * - `creator`: The address of the creator of the template.
     */
    getTemplate(contract: string | Address, templateID: string): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
    /**
     * Get information about all credentials on the template.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string} [templateID] - The ID of the template.
     * @returns `data` of `SuccessResponse` is array of the all credential informations of the template:
     * - `_hint`: Hint for currency,
     * - `_embedded`:
     * - - `credential`:
     * - - - `_hint`: Hint for credential,
     * - - - `holder`: Address of holder,
     * - - - `template_id`: The id for the template,
     * - - - `credential_id`: The id for the credential,
     * - - - `value`: The value of credential,
     * - - - `valid_from`: The timestamp for valid_from,
     * - - - `valid_until`: The timestamp for valid_until,
     * - - - `did`: The name of the credential,
     * - - `is_active`: Indicates whether the credential is active or revoked,
     * - `_links`: links to get additional information of the credential,
     */
    getAllCredentials(contract: string | Address, templateID: string): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
    /**
     * Get all credentials owned by the holder in the credential service.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [holder] - The holder's address claiming the credentials.
     * @returns `data` of `SuccessResponse` is a object with all credential information owned by the holder:
     * - `did`: The did value of the most recently issued credential,
     * - `credentials`: Array of all credential information owned by the holder: {
     * - - `_hint`: Hint for currency,
     * - - `_embedded`:
     * - - - `credential`:
     * - - - - `_hint`: Hint for credential,
     * - - - - `holder`: Address of holder,
     * - - - - `template_id`: The id for the template,
     * - - - - `credential_id`: The id for the credential,
     * - - - - `value`: The value of credential,
     * - - - - `valid_from`: The timestamp for valid_from,
     * - - - - `valid_until`: The timestamp for valid_until,
     * - - - - `did`: The name of the credential,
     * - - - `is_active`: Indicates whether the credential is active or revoked,
     * - - `_links`: links to get additional information of the credential
     */
    getByHolder(contract: string | Address, holder: string | Address): Promise<import("../../types").SuccessResponse | import("../../types").ErrorResponse>;
}
export {};
