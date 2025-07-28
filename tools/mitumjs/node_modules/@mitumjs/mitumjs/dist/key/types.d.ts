export type KEYPAIR_TYPE_MITUM = "mitum";
export type ADDRESS_TYPE_MITUM = "mitum";
export type ADDRESS_TYPE_ZERO = "zero";
export type ADDRESS_TYPE_NODE = "node";
export type AddressType = ADDRESS_TYPE_MITUM | ADDRESS_TYPE_ZERO | ADDRESS_TYPE_NODE;
export type KeyPairType = KEYPAIR_TYPE_MITUM;
export type Account = {
    privatekey: string;
    publickey: string;
    address: string;
};
export type HDAccount = Account & {
    phrase: string | undefined;
    path: string | null;
};
export declare const defaultPath = "m/44'/815'/0'/0/0";
