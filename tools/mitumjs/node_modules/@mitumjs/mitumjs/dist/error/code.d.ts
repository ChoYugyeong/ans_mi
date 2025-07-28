export type ErrorCode = (typeof ECODE[keyof typeof ECODE] | typeof ECODE.HDWALLET[keyof typeof ECODE.HDWALLET] | typeof ECODE.CURRENCY[keyof typeof ECODE.CURRENCY] | typeof ECODE.NFT[keyof typeof ECODE.NFT] | typeof ECODE.STO[keyof typeof ECODE.STO] | typeof ECODE.DAO[keyof typeof ECODE.DAO]);
export declare const ECODE: {
    readonly NO_API: "EC_NO_API";
    readonly UNKNOWN: "EC_UNKNOWN";
    readonly OP_SIZE_EXCEEDED: "EC_OP_SIZE_EXCEEDED";
    readonly EMPTY_STRING: "EC_EMPTY_STRING";
    readonly EMPTY_SIGN: "EC_EMPTY_SIGN";
    readonly INVALID_DATE: "EC_INVALID_DATE";
    readonly INVALID_IP: "EC_INVALID_IP";
    readonly INVALID_LENGTH: "EC_INVALID_LENGTH";
    readonly INVALID_TYPE: "EC_INVALID_TYPE";
    readonly INVALID_SEED: "EC_INVALID_SEED";
    readonly INVALID_KEY: "EC_INVALID_KEY";
    readonly INVALID_KEYS: "EC_INVALID_KEYS";
    readonly INVALID_KEY_PAIR: "EC_INVALID_KEY_PAIR";
    readonly INVALID_PRIVATE_KEY: "EC_INVALID_PRIVATE_KEY";
    readonly INVALID_PUBLIC_KEY: "EC_INVALID_PUBLIC_KEY";
    readonly INVALID_WEIGHT: "EC_INVALID_WEIGHT";
    readonly INVALID_THRESHOLD: "EC_INVALID_THRESHOLD";
    readonly INVALID_ADDRESS: "EC_INVALID_ADDRESS";
    readonly INVALID_ADDRESS_TYPE: "EC_INVALID_ADDRESS_TYPE";
    readonly INVALID_ADDRESS_CHECKSUM: "EC_INVALID_ADDRESS_CHECKSUM";
    readonly INVALID_BIG_INTEGER: "EC_INVALID_BIG_INTERGER";
    readonly INVALID_DECIMAL: "EC_INVALID_DECIMAL";
    readonly INVALID_FLOAT: "EC_INVALID_FLOAT";
    readonly INVALID_UINT8: "EC_INVALID_UINT8";
    readonly INVALID_HINT: "EC_INVALID_HINT";
    readonly INVALID_TOKEN: "EC_INVALID_TOKEN";
    readonly INVALID_CURRENCY_ID: "EC_INVALID_CURRENCY_ID";
    readonly INVALID_CONTRACT_ID: "EC_INVALID_CONTRACT_ID";
    readonly INVALID_NETWORK_ID: "EC_INVALID_NETWORK_ID";
    readonly INVALID_VERSION: "EC_INVALID_VERSION";
    readonly INVALID_ITEM: "EC_INVALID_ITEM";
    readonly INVALID_ITEMS: "EC_INVALID_ITEMS";
    readonly INVALID_FACTSIGN: "EC_INVALID_FACTSIGN";
    readonly INVALID_FACTSIGNS: "EC_INVALID_FACTSIGNS";
    readonly INVALID_SIG_TYPE: "EC_INVALID_SIG_TYPE";
    readonly INVALID_FACT: "EC_INVALID_FACT";
    readonly INVALID_FACT_HASH: "EC_INVALID_FACT_HASH";
    readonly INVALID_OPERATION: "EC_INVALID_OPERATION";
    readonly INVALID_OPERATIONS: "EC_INVALID_OPERATIONS";
    readonly INVALID_USER_OPERATION: "EC_INVALID_USER_OPERATION";
    readonly INVALID_SEAL: "EC_INVALID_SEAL";
    readonly INVALID_AMOUNT: "EC_INVALID_AMOUNT";
    readonly INVALID_AMOUNTS: "EC_INVALID_AMOUNTS";
    readonly INVALID_RATIO: "EC_INVALID_RATIO";
    readonly INVALID_DATA_STRUCTURE: "EC_INVALID_DATA_STRUCTURE";
    readonly INVALID_CHARACTER: "EC_NVALID_CHARACTER";
    readonly NOT_IMPLEMENTED_BUFFER: "EC_NOT_IMPLEMENTED_BUFFER";
    readonly NOT_IMPLEMENTED_HINTED_OBJECT: "EC_NOT_IMPLEMENTED_HINTED_OBJECT";
    readonly NOT_IMPLEMENTED_METHOD: "EC_NOT_IMPLEMENTED_METHOD";
    readonly FAIL_FILE_CREATION: "EC_FAIL_FILE_CREATION";
    readonly FAIL_SIGN: "EC_FAIL_SIGN";
    readonly HDWALLET: {
        readonly INVALID_PHRASE: "EC_INVALID_PHRASE";
        readonly INVALID_PATH: "EC_INVALID_PATH";
    };
    readonly CURRENCY: {
        readonly INVALID_CURRENCY_FEEER: "EC_INVALID_CURRENCY_FEEER";
        readonly INVALID_CURRENCY_POLICY: "EC_INVALID_CURRENCY_POLICY";
        readonly INVALID_CURRENCY_DESIGN: "EC_INVALID_CURRENCY_DESIGN";
    };
    readonly AUTH_DID: {
        readonly INVALID_DID: "EC_INVALID_DID";
        readonly INVALID_DOCUMENT: "EC_INVALID_DOCUMENT";
        readonly INVALID_AUTHENTICATION: "EC_INVALID_AUTHENTICATION";
    };
    readonly NFT: {
        readonly INVALID_NFT_SIGNER: "EC_INVALID_NFT_SIGNER";
        readonly INVALID_NFT_SIGNERS: "EC_INVALID_NFT_SIGNERS";
    };
    readonly STO: {
        readonly INVALID_PARTITION: "EC_INVALID_PARTITION";
    };
    readonly DAO: {
        readonly INVALID_POLICY: "EC_INVALID_POLICY";
        readonly INVALID_WHITELIST: "EC_INVALID_WHITELIST";
        readonly UNMATCHED_SENDER: "EC_UNMATCHED_SENDER";
    };
    readonly TIME_OUT: "EC_TIME_OUT";
    readonly TRANSACTION_REVERTED: "EC_TRANSACTION_REVERTED";
};
export declare const PCODE: {
    readonly AMBIGUOUS: {
        readonly code: "P0A";
        readonly keyword: readonly [""];
        readonly description: "Ambiguous error";
        readonly subject: "";
    };
    readonly MITUM_CORE: {
        readonly code: "P0M";
        readonly keyword: readonly [""];
        readonly description: "Error from Mitum core";
        readonly subject: "";
    };
    readonly UNDEFINED: {
        readonly code: "P00";
        readonly keyword: readonly [""];
        readonly description: "Undefined error";
        readonly subject: "";
    };
    readonly IV_BASE_OP: {
        readonly code: "P01";
        readonly keyword: readonly ["Invalid BaseOperation"];
        readonly description: "Error from IsValid(BaseOperation)";
        readonly subject: "";
    };
    readonly IV_BASE_NODE_OP: {
        readonly code: "P02";
        readonly keyword: readonly ["Invalid BaseNodeOperation"];
        readonly description: "Error from IsValid(BaseNodeOperation)";
        readonly subject: "";
    };
    readonly IV_BASE_STATE: {
        readonly code: "P03";
        readonly keyword: readonly ["Invalid BaseState"];
        readonly description: "Error from IsValid(BaseState)";
        readonly subject: "";
    };
    readonly IV_FACT: {
        readonly code: "P04";
        readonly keyword: readonly ["Invalid fact"];
        readonly description: "Error from IsValid(Fact)";
        readonly subject: "";
    };
    readonly IV_ITEM: {
        readonly code: "P05";
        readonly keyword: readonly ["Invalid item"];
        readonly description: "Error from IsValid(Item)";
        readonly subject: "";
    };
    readonly PREPROCESS: {
        readonly code: "P06";
        readonly keyword: readonly ["PreProcess"];
        readonly description: "Error from PreProcess";
        readonly subject: "";
    };
    readonly DECODE_JSON: {
        readonly code: "P07";
        readonly keyword: readonly ["Decode Json"];
        readonly description: "Error from DecodeJSON";
        readonly subject: "";
    };
    readonly DECODE_BSON: {
        readonly code: "P08";
        readonly keyword: readonly ["Decode Bson"];
        readonly description: "Error from DecodeBSON";
        readonly subject: "";
    };
};
export declare const DCODE: {
    readonly AMBIGUOUS: {
        readonly code: "D00A";
        readonly keyword: readonly [""];
        readonly description: "Ambiguous error";
        readonly subject: "";
    };
    readonly COMPLEX: {
        readonly code: "D00C";
        readonly keyword: readonly [""];
        readonly description: "Complex error with multiple DCODE";
        readonly subject: "";
    };
    readonly OP_DEP: {
        readonly code: "D00D";
        readonly keyword: readonly [""];
        readonly description: "Operation dependent error";
        readonly subject: "";
    };
    readonly UNDEFINED: {
        readonly code: "D000";
        readonly keyword: readonly [""];
        readonly description: "Undefined error";
        readonly subject: "";
    };
    readonly EMPTY: {
        readonly code: "D101";
        readonly keyword: readonly [""];
        readonly description: "Empty or null data";
        readonly subject: "";
    };
    readonly IV_LEN: {
        readonly code: "D102";
        readonly keyword: readonly ["Array length"];
        readonly description: "The provided array exceeds the allowed length.";
        readonly subject: "";
    };
    readonly IV_RANGE: {
        readonly code: "D103";
        readonly keyword: readonly ["Value out of range"];
        readonly description: "The variable exceeds the allowed range.";
        readonly subject: "";
    };
    readonly IV_VAL: {
        readonly code: "D104";
        readonly keyword: readonly ["Invalid value"];
        readonly description: "Invalid string, Insufficient balance, Invalid state change etc.";
        readonly subject: "";
    };
    readonly IV_DUP: {
        readonly code: "D105";
        readonly keyword: readonly ["Duplicated value"];
        readonly description: "The item contains duplicate values.";
        readonly subject: "";
    };
    readonly SELF_TARGET: {
        readonly code: "D106";
        readonly keyword: readonly ["Self targeted"];
        readonly description: "Duplicate account addresses provided in an invalid manner. (sender=receiver, sender=contract, etc.)";
        readonly subject: "";
    };
    readonly IV_SIGN: {
        readonly code: "D201";
        readonly keyword: readonly ["Invalid signing"];
        readonly description: "The private key does not match the address or node sign required or the signatures for the multiSig account do not meet the threshold";
        readonly subject: "";
    };
    readonly IV_ALTERSIGN: {
        readonly code: "D202";
        readonly keyword: readonly ["Invalid user signing"];
        readonly description: "Alternative signature for account abstraction operation is not valid";
        readonly subject: "";
    };
    readonly NO_AUTH: {
        readonly code: "D301";
        readonly keyword: readonly ["Account not authorized"];
        readonly description: "The sender account does not have permission to execute the operation.";
        readonly subject: "";
    };
    readonly CA_DISALLOW: {
        readonly code: "D302";
        readonly keyword: readonly ["Contract account not allowed"];
        readonly description: "A contract account cannot be used as sender, receiver etc.";
        readonly subject: "";
    };
    readonly IV_AUTH_TYPE: {
        readonly code: "D303";
        readonly keyword: readonly ["Invalid Auth Type"];
        readonly description: "Occurs when there is a problem with authentication_id in the account abstraction operation.(If verificationMethod of social_login authentication is another social_login)";
        readonly subject: "";
    };
    readonly CA_RESTRICTED: {
        readonly code: "D304";
        readonly keyword: readonly ["Contract account restricted"];
        readonly description: "Contract account with contract_account_status.balance_status is 1, the owner cannot withdraw.";
        readonly subject: "";
    };
    readonly INSUFF_BAL: {
        readonly code: "D401";
        readonly keyword: readonly [""];
        readonly description: "Insufficient token or point balance.";
        readonly subject: "";
    };
    readonly NF_CUR: {
        readonly code: "D501";
        readonly keyword: readonly ["Currency not found"];
        readonly description: "The currency cannot be found on the blockchain.";
        readonly subject: "";
    };
    readonly NF_ACC: {
        readonly code: "D502";
        readonly keyword: readonly ["Account not found", "Contract account not found"];
        readonly description: "The account or contract account cannot be found on the blockchain.";
        readonly subject: "";
    };
    readonly NF_SERVICE: {
        readonly code: "D503";
        readonly keyword: readonly ["Service not found"];
        readonly description: "The service cannot be found in the given contract.";
        readonly subject: "";
    };
    readonly NF_STATE: {
        readonly code: "D504";
        readonly keyword: readonly ["State not found"];
        readonly description: "The state cannot be found on the blockchain.";
        readonly subject: "";
    };
    readonly EXIST_CUR: {
        readonly code: "D505";
        readonly keyword: readonly ["Currency exist"];
        readonly description: "The currency already exists on the blockchain.";
        readonly subject: "";
    };
    readonly EXIST_ACC: {
        readonly code: "D506";
        readonly keyword: readonly ["Account exist", "Contract account exist"];
        readonly description: "The account or contract account already exists on the blockchain.";
        readonly subject: "";
    };
    readonly EXIST_SERVICE: {
        readonly code: "D507";
        readonly keyword: readonly ["Service exist"];
        readonly description: "The contract already contains the service.";
        readonly subject: "";
    };
    readonly EXIST_STATE: {
        readonly code: "D508";
        readonly keyword: readonly ["State exist"];
        readonly description: "The state already exists on the blockchain.";
        readonly subject: "";
    };
};
export declare const assignCodeFromErrorMessage: (errorMessage: string) => string;
