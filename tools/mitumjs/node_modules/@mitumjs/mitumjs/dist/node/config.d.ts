export type Setting<T> = {
    get: () => T;
    set: (val: T) => T;
};
export declare const Version: Setting<string>;
export declare const NetworkID: Setting<string>;
export type RangeConfig = {
    value?: number;
    min: number;
    max: number;
    satisfy: (target: number) => boolean;
};
export declare const Config: {
    SUFFIX: {
        DEFAULT: RangeConfig;
        ZERO_ADDRESS: RangeConfig;
    };
    CURRENCY_ID: RangeConfig;
    CONTRACT_ID: RangeConfig;
    SEED: RangeConfig;
    THRESHOLD: RangeConfig;
    WEIGHT: RangeConfig;
    ADDRESS: {
        DEFAULT: RangeConfig;
        ZERO: RangeConfig;
        NODE: RangeConfig;
    };
    CONTRACT_HANDLERS: RangeConfig;
    KEYS_IN_ACCOUNT: RangeConfig;
    AMOUNTS_IN_ITEM: RangeConfig;
    ITEMS_IN_FACT: RangeConfig;
    OP_SIZE: RangeConfig;
    FACT_HASHES: RangeConfig;
    KEY: {
        MITUM: {
            PRIVATE: RangeConfig;
            PUBLIC: RangeConfig;
        };
    };
    NFT: {
        ROYALTY: RangeConfig;
        SHARE: RangeConfig;
        ADDRESS_IN_MINTER_WHITELIST: RangeConfig;
        SIGNERS_IN_SIGNERS: RangeConfig;
        HASH: RangeConfig;
        URI: RangeConfig;
    };
    CREDENTIAL: {
        ID: RangeConfig;
        VALUE: RangeConfig;
        TEMPLATE_ID: RangeConfig;
        TEMPLATE_NAME: RangeConfig;
        DISPLAY_NAME: RangeConfig;
        SUBJECT_KEY: RangeConfig;
        DESCRIPTION: RangeConfig;
    };
    TIMESTAMP: {
        PROJECT_ID: RangeConfig;
        DATA: RangeConfig;
    };
    STO: {
        PARTITION: RangeConfig;
    };
    DAO: {
        ADDRESS_IN_WHITELIST: RangeConfig;
        QUORUM: RangeConfig;
        VOTE: RangeConfig;
    };
    STORAGE: {
        PROJECT: RangeConfig;
        DATA_KEY: RangeConfig;
        DATA_VALUE: RangeConfig;
    };
};
