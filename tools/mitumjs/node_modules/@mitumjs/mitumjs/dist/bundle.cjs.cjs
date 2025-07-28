'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Int64 = require('int64-buffer');
var bigInt = require('big-integer');
var axios = require('axios');
var jsSha3 = require('js-sha3');
var base58 = require('bs58');
var ethers = require('ethers');
var hmac = require('@noble/hashes/hmac');
var sha256$1 = require('@noble/hashes/sha256');
var secp256k1 = require('@noble/secp256k1');
var crypto = require('crypto');
var elliptic = require('elliptic');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var secp256k1__namespace = /*#__PURE__*/_interopNamespaceDefault(secp256k1);
var crypto__namespace = /*#__PURE__*/_interopNamespaceDefault(crypto);

const ECODE = {
    // General Errors
    NO_API: "EC_NO_API",
    UNKNOWN: "EC_UNKNOWN",
    // Operation Errors
    OP_SIZE_EXCEEDED: "EC_OP_SIZE_EXCEEDED",
    EMPTY_STRING: "EC_EMPTY_STRING",
    EMPTY_SIGN: "EC_EMPTY_SIGN",
    // Validation Errors
    /// Date and Time Validation
    INVALID_DATE: "EC_INVALID_DATE",
    /// IP Address Validation
    INVALID_IP: "EC_INVALID_IP",
    /// Length Validation
    INVALID_LENGTH: "EC_INVALID_LENGTH",
    /// Type Validation
    INVALID_TYPE: "EC_INVALID_TYPE",
    /// Seed and Key Validation
    INVALID_SEED: "EC_INVALID_SEED",
    INVALID_KEY: "EC_INVALID_KEY",
    INVALID_KEYS: "EC_INVALID_KEYS",
    INVALID_KEY_PAIR: "EC_INVALID_KEY_PAIR",
    INVALID_PRIVATE_KEY: "EC_INVALID_PRIVATE_KEY",
    INVALID_PUBLIC_KEY: "EC_INVALID_PUBLIC_KEY",
    INVALID_WEIGHT: "EC_INVALID_WEIGHT",
    INVALID_THRESHOLD: "EC_INVALID_THRESHOLD",
    INVALID_ADDRESS: "EC_INVALID_ADDRESS",
    INVALID_ADDRESS_TYPE: "EC_INVALID_ADDRESS_TYPE",
    INVALID_ADDRESS_CHECKSUM: "EC_INVALID_ADDRESS_CHECKSUM",
    /// Data Validation
    //// Number
    INVALID_BIG_INTEGER: "EC_INVALID_BIG_INTERGER",
    INVALID_DECIMAL: "EC_INVALID_DECIMAL",
    INVALID_FLOAT: "EC_INVALID_FLOAT",
    INVALID_UINT8: "EC_INVALID_UINT8",
    //// Operation Contents
    INVALID_HINT: "EC_INVALID_HINT",
    INVALID_TOKEN: "EC_INVALID_TOKEN",
    INVALID_CURRENCY_ID: "EC_INVALID_CURRENCY_ID",
    INVALID_CONTRACT_ID: "EC_INVALID_CONTRACT_ID",
    INVALID_NETWORK_ID: "EC_INVALID_NETWORK_ID",
    INVALID_VERSION: "EC_INVALID_VERSION",
    INVALID_ITEM: "EC_INVALID_ITEM",
    INVALID_ITEMS: "EC_INVALID_ITEMS",
    INVALID_FACTSIGN: "EC_INVALID_FACTSIGN",
    INVALID_FACTSIGNS: "EC_INVALID_FACTSIGNS",
    INVALID_SIG_TYPE: "EC_INVALID_SIG_TYPE",
    INVALID_FACT: "EC_INVALID_FACT",
    INVALID_FACT_HASH: "EC_INVALID_FACT_HASH",
    INVALID_OPERATION: "EC_INVALID_OPERATION",
    INVALID_OPERATIONS: "EC_INVALID_OPERATIONS",
    INVALID_USER_OPERATION: "EC_INVALID_USER_OPERATION",
    INVALID_SEAL: "EC_INVALID_SEAL",
    INVALID_AMOUNT: "EC_INVALID_AMOUNT",
    INVALID_AMOUNTS: "EC_INVALID_AMOUNTS",
    INVALID_RATIO: "EC_INVALID_RATIO",
    INVALID_DATA_STRUCTURE: "EC_INVALID_DATA_STRUCTURE",
    INVALID_CHARACTER: "EC_NVALID_CHARACTER",
    // Not Implemented Errors
    NOT_IMPLEMENTED_BUFFER: "EC_NOT_IMPLEMENTED_BUFFER",
    NOT_IMPLEMENTED_HINTED_OBJECT: "EC_NOT_IMPLEMENTED_HINTED_OBJECT",
    NOT_IMPLEMENTED_METHOD: "EC_NOT_IMPLEMENTED_METHOD",
    // Failure Errors
    FAIL_FILE_CREATION: "EC_FAIL_FILE_CREATION",
    FAIL_SIGN: "EC_FAIL_SIGN",
    // HDWallet Errors
    HDWALLET: {
        INVALID_PHRASE: "EC_INVALID_PHRASE",
        INVALID_PATH: "EC_INVALID_PATH",
    },
    // Currency Errors
    CURRENCY: {
        INVALID_CURRENCY_FEEER: "EC_INVALID_CURRENCY_FEEER",
        INVALID_CURRENCY_POLICY: "EC_INVALID_CURRENCY_POLICY",
        INVALID_CURRENCY_DESIGN: "EC_INVALID_CURRENCY_DESIGN",
    },
    // AUTH_DID Errors
    AUTH_DID: {
        INVALID_DID: "EC_INVALID_DID",
        INVALID_DOCUMENT: "EC_INVALID_DOCUMENT",
        INVALID_AUTHENTICATION: "EC_INVALID_AUTHENTICATION"
    },
    // NFT Errors
    NFT: {
        INVALID_NFT_SIGNER: "EC_INVALID_NFT_SIGNER",
        INVALID_NFT_SIGNERS: "EC_INVALID_NFT_SIGNERS",
    },
    // STO Errors
    STO: {
        INVALID_PARTITION: "EC_INVALID_PARTITION",
    },
    // DAO Errors
    DAO: {
        INVALID_POLICY: "EC_INVALID_POLICY",
        INVALID_WHITELIST: "EC_INVALID_WHITELIST",
        UNMATCHED_SENDER: "EC_UNMATCHED_SENDER"
    },
    // Transaction Errors
    TIME_OUT: "EC_TIME_OUT",
    TRANSACTION_REVERTED: "EC_TRANSACTION_REVERTED"
};
// ECODE: Mitum Node Process Error code
const PCODE = {
    AMBIGUOUS: {
        code: "P0A",
        keyword: [""],
        description: "Ambiguous error",
        subject: "",
    },
    MITUM_CORE: {
        code: "P0M",
        keyword: [""],
        description: "Error from Mitum core",
        subject: "",
    },
    UNDEFINED: {
        code: "P00",
        keyword: [""],
        description: "Undefined error",
        subject: "",
    },
    IV_BASE_OP: {
        code: "P01",
        keyword: ["Invalid BaseOperation"],
        description: "Error from IsValid(BaseOperation)",
        subject: "",
    },
    IV_BASE_NODE_OP: {
        code: "P02",
        keyword: ["Invalid BaseNodeOperation"],
        description: "Error from IsValid(BaseNodeOperation)",
        subject: "",
    },
    IV_BASE_STATE: {
        code: "P03",
        keyword: ["Invalid BaseState"],
        description: "Error from IsValid(BaseState)",
        subject: "",
    },
    IV_FACT: {
        code: "P04",
        keyword: ["Invalid fact"],
        description: "Error from IsValid(Fact)",
        subject: "",
    },
    IV_ITEM: {
        code: "P05",
        keyword: ["Invalid item"],
        description: "Error from IsValid(Item)",
        subject: "",
    },
    PREPROCESS: {
        code: "P06",
        keyword: ["PreProcess"],
        description: "Error from PreProcess",
        subject: "",
    },
    DECODE_JSON: {
        code: "P07",
        keyword: ["Decode Json"],
        description: "Error from DecodeJSON",
        subject: "",
    },
    DECODE_BSON: {
        code: "P08",
        keyword: ["Decode Bson"],
        description: "Error from DecodeBSON",
        subject: "",
    },
};
const DCODE = {
    AMBIGUOUS: {
        code: "D00A",
        keyword: [""],
        description: "Ambiguous error",
        subject: "",
    },
    COMPLEX: {
        code: "D00C",
        keyword: [""],
        description: "Complex error with multiple DCODE",
        subject: "",
    },
    OP_DEP: {
        code: "D00D",
        keyword: [""],
        description: "Operation dependent error",
        subject: "",
    },
    UNDEFINED: {
        code: "D000",
        keyword: [""],
        description: "Undefined error",
        subject: ""
    },
    // Related to data validation
    EMPTY: {
        code: "D101",
        keyword: [""],
        description: "Empty or null data",
        subject: ""
    },
    IV_LEN: {
        code: "D102",
        keyword: ["Array length"],
        description: "The provided array exceeds the allowed length.",
        subject: ""
    },
    IV_RANGE: {
        code: "D103",
        keyword: ["Value out of range"],
        description: "The variable exceeds the allowed range.",
        subject: ""
    },
    IV_VAL: {
        code: "D104",
        keyword: ["Invalid value"],
        description: "Invalid string, Insufficient balance, Invalid state change etc.",
        subject: ""
    },
    IV_DUP: {
        code: "D105",
        keyword: ["Duplicated value"],
        description: "The item contains duplicate values.",
        subject: ""
    },
    SELF_TARGET: {
        code: "D106",
        keyword: ["Self targeted"],
        description: "Duplicate account addresses provided in an invalid manner. (sender=receiver, sender=contract, etc.)",
        subject: ""
    },
    // Related to signature
    IV_SIGN: {
        code: "D201",
        keyword: ["Invalid signing"],
        description: "The private key does not match the address or node sign required or the signatures for the multiSig account do not meet the threshold",
        subject: ""
    },
    IV_ALTERSIGN: {
        code: "D202",
        keyword: ["Invalid user signing"],
        description: "Alternative signature for account abstraction operation is not valid",
        subject: ""
    },
    // Related to permission
    NO_AUTH: {
        code: "D301",
        keyword: ["Account not authorized"],
        description: "The sender account does not have permission to execute the operation.",
        subject: ""
    },
    CA_DISALLOW: {
        code: "D302",
        keyword: ["Contract account not allowed"],
        description: "A contract account cannot be used as sender, receiver etc.",
        subject: ""
    },
    IV_AUTH_TYPE: {
        code: "D303",
        keyword: ["Invalid Auth Type"],
        description: "Occurs when there is a problem with authentication_id in the account abstraction operation.(If verificationMethod of social_login authentication is another social_login)",
        subject: ""
    },
    CA_RESTRICTED: {
        code: "D304",
        keyword: ["Contract account restricted"],
        description: "Contract account with contract_account_status.balance_status is 1, the owner cannot withdraw.",
        subject: ""
    },
    // Insufficient balance
    INSUFF_BAL: {
        code: "D401",
        keyword: [""],
        description: "Insufficient token or point balance.",
        subject: ""
    },
    // Related to state
    NF_CUR: {
        code: "D501",
        keyword: ["Currency not found"],
        description: "The currency cannot be found on the blockchain.",
        subject: ""
    },
    NF_ACC: {
        code: "D502",
        keyword: ["Account not found", "Contract account not found"],
        description: "The account or contract account cannot be found on the blockchain.",
        subject: ""
    },
    NF_SERVICE: {
        code: "D503",
        keyword: ["Service not found"],
        description: "The service cannot be found in the given contract.",
        subject: ""
    },
    NF_STATE: {
        code: "D504",
        keyword: ["State not found"],
        description: "The state cannot be found on the blockchain.",
        subject: ""
    },
    EXIST_CUR: {
        code: "D505",
        keyword: ["Currency exist"],
        description: "The currency already exists on the blockchain.",
        subject: ""
    },
    EXIST_ACC: {
        code: "D506",
        keyword: ["Account exist", "Contract account exist"],
        description: "The account or contract account already exists on the blockchain.",
        subject: ""
    },
    EXIST_SERVICE: {
        code: "D507",
        keyword: ["Service exist"],
        description: "The contract already contains the service.",
        subject: ""
    },
    EXIST_STATE: {
        code: "D508",
        keyword: ["State exist"],
        description: "The state already exists on the blockchain.",
        subject: ""
    },
};
const assignCodeFromErrorMessage = (errorMessage) => {
    const findCode = (codeSet, errorMessage) => {
        return Object.values(codeSet)
            .filter((obj) => obj.keyword.length > 0 && obj.keyword[0] !== "")
            .filter((obj) => obj.keyword.some((keyword) => errorMessage.includes(keyword)))
            .map((obj) => obj.code);
    };
    let pcodeArr = findCode(PCODE, errorMessage);
    let dcodeArr = findCode(DCODE, errorMessage);
    pcodeArr.length === 0 && pcodeArr.push(PCODE.UNDEFINED.code);
    dcodeArr.length === 0 && dcodeArr.push(DCODE.UNDEFINED.code);
    if (dcodeArr.includes(DCODE.CA_DISALLOW.code)) {
        dcodeArr = [DCODE.CA_DISALLOW.code];
    }
    else if (dcodeArr.length > 1) {
        dcodeArr = [DCODE.COMPLEX.code];
    }
    if (pcodeArr.includes(PCODE.IV_BASE_NODE_OP.code)) {
        pcodeArr = [PCODE.IV_BASE_NODE_OP.code];
    }
    else if (pcodeArr.length > 1) {
        pcodeArr = [PCODE.AMBIGUOUS.code];
    }
    return pcodeArr[0] + dcodeArr[0];
};

class MitumError extends Error {
    constructor(code, msg) {
        super(msg);
        this.code = code;
    }
    static new() {
        return new MitumError(ECODE.UNKNOWN);
    }
    static detail(code, msg) {
        return new MitumError(code ?? ECODE.UNKNOWN, msg);
    }
}
class Assert {
    constructor(condition, error) {
        this.condition = condition;
        this.error = error;
    }
    static get(condition, error) {
        return new Assert(condition, error ?? MitumError.new());
    }
    static check(condition, error) {
        Assert.get(condition, error).excute();
    }
    not() {
        this.condition = !this.condition;
        return this;
    }
    true() {
        return this;
    }
    false() {
        return this.not();
    }
    excute() {
        if (!this.condition) {
            throw this.error;
        }
    }
}
class StringAssert {
    constructor(s, error) {
        this.s = s;
        this.error = error;
        this.condition = undefined;
    }
    static with(s, error) {
        return new StringAssert(s, error ?? MitumError.new());
    }
    union(condition) {
        if (this.condition !== undefined) {
            this.condition = this.condition && condition;
        }
        else {
            this.condition = condition;
        }
    }
    not() {
        if (this.condition !== undefined) {
            this.condition = !this.condition;
        }
        return this;
    }
    empty() {
        this.union(this.s === "");
        return this;
    }
    equal(s) {
        this.union(this.s === s);
        return this;
    }
    startsWith(...pre) {
        this.union(pre.reduce((prev, curr) => prev || this.s.startsWith(curr), false));
        return this;
    }
    endsWith(...suf) {
        this.union(suf.reduce((prev, curr) => prev || this.s.endsWith(curr), false));
        return this;
    }
    satisfyConfig(config) {
        this.union(config.satisfy(this.s.length));
        return this;
    }
    chainAnd(...conditions) {
        this.union(conditions.reduce((prev, curr) => prev && curr, true));
        return this;
    }
    chainOr(...conditions) {
        this.union(conditions.reduce((prev, curr) => prev || curr, false));
        return this;
    }
    excute() {
        if (!this.condition) {
            throw this.error;
        }
    }
}
class ArrayAssert {
    constructor(array, arrayName) {
        this.validType = false;
        this.array = array;
        this.arrayName = arrayName;
    }
    validateType() {
        if (this.validType)
            return;
        if (!Array.isArray(this.array)) {
            throw MitumError.detail(ECODE.INVALID_TYPE, `the ${this.arrayName} must be in array type`);
        }
        this.validType = true;
    }
    notEmpty() {
        this.validateType();
        if (this.array.length === 0) {
            throw MitumError.detail(ECODE.INVALID_LENGTH, `${this.arrayName} cannot be an empty array`);
        }
        return this;
    }
    exactLength(length) {
        this.validateType();
        if (this.array.length !== length) {
            throw MitumError.detail(ECODE.INVALID_LENGTH, `the length of ${this.arrayName} must be ${length}, but got ${this.array.length}`);
        }
        return this;
    }
    rangeLength(rangeConfig) {
        this.validateType();
        Assert.check(rangeConfig.satisfy(this.array.length), MitumError.detail(ECODE.INVALID_LENGTH, `The length of ${this.arrayName} must be between ${rangeConfig.min} and ${rangeConfig.max}, but got ${this.array.length}`));
        return this;
    }
    maxLength(max) {
        this.validateType();
        if (this.array.length > max) {
            throw MitumError.detail(ECODE.INVALID_LENGTH, `the length of ${this.arrayName} must not exceed ${max}`);
        }
        return this;
    }
    sameLength(array2, arrayName2) {
        this.validateType();
        if (!Array.isArray(array2)) {
            throw MitumError.detail(ECODE.INVALID_TYPE, `the ${arrayName2} must be in array type`);
        }
        if (this.array.length !== array2.length) {
            throw MitumError.detail(ECODE.INVALID_LENGTH, `The lengths of the ${this.arrayName} and ${arrayName2} must be the same.`);
        }
        return this;
    }
    noDuplicates() {
        this.validateType();
        const uniqueItems = new Set(this.array.map((el) => { return el.toString(); }));
        if (uniqueItems.size !== this.array.length) {
            throw MitumError.detail(ECODE.INVALID_LENGTH, `${this.arrayName} cannot contain duplicate elements`);
        }
        return this;
    }
    static check(array, arrayName) {
        return new ArrayAssert(array, arrayName);
    }
}

class LongString {
    constructor(s) {
        Assert.check(typeof (s) === "string", MitumError.detail(ECODE.INVALID_TYPE, `${s} is not in string type`));
        Assert.check(s !== "", MitumError.detail(ECODE.EMPTY_STRING, "empty string"));
        this.s = s;
    }
    static from(s) {
        return s instanceof LongString ? s : new LongString(s);
    }
    toBuffer() {
        return Buffer.from(this.s);
    }
    toString() {
        return this.s;
    }
}
class ShortDate extends LongString {
    constructor(s) {
        super(s);
        Assert.check(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(s), MitumError.detail(ECODE.INVALID_DATE, "invalid simple string date"));
    }
    static from(s) {
        return s instanceof ShortDate ? s : new ShortDate(s);
    }
}
class IP extends LongString {
    constructor(s) {
        super(s);
        Assert.check(/^(http|https):\/\/(?:[\w-]+\.)*[\w-]+(?::\d+)?(?:\/[\w-./?%&=]*)?$/.test(s), MitumError.detail(ECODE.INVALID_IP, "invalid ip address, ip"));
    }
    static from(s) {
        return s instanceof IP ? s : new IP(s);
    }
}
class URIString {
    constructor(s, name) {
        Assert.check((/^[^\s:/?#\[\]@]*$/.test(s)), MitumError.detail(ECODE.INVALID_CHARACTER, `${name} must not contain: space / : ? # [ ] @`));
    }
}

class Generator {
    constructor(networkID, api, delegateIP) {
        this._networkID = networkID;
        this.setAPI(api);
        this.setDelegate(delegateIP);
    }
    setNetworkID(networkID) {
        this._networkID = networkID;
    }
    setAPI(api) {
        if (typeof api === "string") {
            this._api = IP.from(api.endsWith('/') ? api.slice(0, -1) : api);
        }
        else if (api instanceof IP) {
            this._api = api;
        }
        else {
            this._api = undefined;
        }
    }
    setDelegate(delegateIP) {
        if (typeof delegateIP === "string") {
            this._delegateIP = IP.from(delegateIP.endsWith('/') ? delegateIP.slice(0, -1) : delegateIP);
        }
        else if (delegateIP instanceof IP) {
            this._delegateIP = delegateIP;
        }
        else {
            this._delegateIP = undefined;
        }
    }
    get networkID() {
        return this._networkID;
    }
    get api() {
        return this._api ? this._api.toString() : undefined;
    }
    get delegateIP() {
        return this._delegateIP ? this._delegateIP.toString() : undefined;
    }
}

class Big {
    constructor(big) {
        switch (typeof big) {
            case "number":
            case "string":
            case "bigint":
                this.big = BigInt(big);
                break;
            case "object":
                if (big instanceof Buffer || big instanceof Uint8Array) {
                    this.big = this.bufferToBig(big);
                }
                else {
                    throw MitumError.detail(ECODE.INVALID_BIG_INTEGER, "wrong big");
                }
                break;
            default:
                throw MitumError.detail(ECODE.INVALID_BIG_INTEGER, "wrong big");
        }
    }
    static from(big) {
        return big instanceof Big ? big : new Big(big);
    }
    bufferToBig(big) {
        const res = [];
        Uint8Array.from(big).forEach((n) => {
            let s = n.toString(16);
            s.length % 2 ? res.push("0" + s) : res.push(s);
        });
        return BigInt("0x" + res.join(""));
    }
    toBuffer(option) {
        const size = this.byteLen();
        if (option === "fill") {
            Assert.check(size <= 8, MitumError.detail(ECODE.INVALID_BIG_INTEGER, "big out of range"));
            return Buffer.from(new Int64.Uint64BE(this.toString()).toBuffer());
        }
        const buf = new Uint8Array(size);
        let n = bigInt(this.big);
        for (let i = size - 1; i >= 0; i--) {
            buf[i] = n.mod(256).valueOf();
            n = n.divide(256);
        }
        return Buffer.from(buf);
    }
    byteLen() {
        const bitLen = bigInt(this.big).bitLength();
        const quotient = bigInt(bitLen).divide(8);
        if (bitLen.valueOf() - quotient.valueOf() * 8 > 0) {
            return quotient.valueOf() + 1;
        }
        return quotient.valueOf();
    }
    get v() {
        if (this.big <= BigInt(Number.MAX_SAFE_INTEGER)) {
            return parseInt(this.toString());
        }
        return -1;
    }
    toString() {
        return this.big.toString();
    }
    overZero() {
        return this.big > 0;
    }
    compare(n) {
        n = Big.from(n);
        if (this.big < n.big) {
            return -1;
        }
        else if (this.big > n.big) {
            return 1;
        }
        return 0;
    }
}
class Float {
    constructor(n) {
        this.n = n;
    }
    static from(n) {
        return n instanceof Float ? n : new Float(n);
    }
    toBuffer() {
        const b = Buffer.allocUnsafe(8);
        b.writeDoubleBE(this.n);
        return b;
    }
    toString() {
        return "" + this.n;
    }
}
class Bool {
    constructor(b) {
        this.b = b;
    }
    static from(b) {
        return b instanceof Bool ? b : new Bool(b);
    }
    toBuffer() {
        return this.b ? Buffer.from([1]) : Buffer.from([0]);
    }
    get v() {
        return this.b;
    }
}

let TimeStamp$1 = class TimeStamp {
    constructor(t) {
        if (t === undefined) {
            this.t = new Date();
        }
        else {
            this.t = new Date(t);
        }
    }
    static new() {
        return new TimeStamp();
    }
    static from(t) {
        if (!t) {
            return this.new();
        }
        return t instanceof TimeStamp ? t : new TimeStamp(t);
    }
    toBuffer() {
        return Buffer.from(this.UTC());
    }
    toString() {
        return this.ISO();
    }
    ISO() {
        return this.t.toISOString();
    }
    UTC() {
        const iso = this.t.toISOString();
        const t = iso.indexOf("T");
        let z = iso.indexOf("Z");
        let rtime;
        if (z < 0) {
            z = iso.indexOf("+");
        }
        Assert.check(0 <= z, MitumError.detail(undefined, "no 'Z' in iso"));
        let _time = iso.substring(t + 1, z);
        const dotIdx = _time.indexOf(".");
        if (dotIdx < 0) {
            rtime = _time;
        }
        else {
            const decimal = _time.substring(9, _time.length);
            const idx = decimal.lastIndexOf("0");
            if (idx < 0 || idx != decimal.length - 1) {
                rtime = _time;
            }
            else {
                let startIdx = decimal.length - 1;
                for (let i = decimal.length - 1; i > -1; i--) {
                    if (decimal[i] == "0") {
                        startIdx = i;
                    }
                    else {
                        break;
                    }
                }
                if (startIdx == 0) {
                    rtime = _time.substring(0, dotIdx);
                }
                else {
                    rtime =
                        _time.substring(0, dotIdx) +
                            "." +
                            decimal.substring(0, startIdx);
                }
            }
        }
        return iso.substring(0, t) + " " + rtime + " +0000 UTC";
    }
};
class FullTimeStamp extends TimeStamp$1 {
    constructor(s) {
        super(s);
        const dot = s.indexOf(".");
        if (dot < 0) {
            this.r = "";
        }
        else {
            this.r = s.substring(dot, s.length);
        }
    }
    static from(t) {
        return t instanceof FullTimeStamp ? t : new FullTimeStamp(t);
    }
    toBuffer(option) {
        return Buffer.from(option === "super" ? super.UTC() : this.UTC());
    }
    ISO() {
        const iso = super.ISO();
        if (this.r) {
            const idx = iso.indexOf(".");
            return iso.substring(0, idx) + this.r;
        }
        return iso;
    }
    UTC() {
        const utc = super.UTC();
        if (this.r) {
            const idx0 = utc.indexOf(".");
            const idx1 = utc.indexOf("+");
            return utc.substring(0, idx0) + this.r + " " + utc.substring(idx1);
        }
        return utc;
    }
}

const Version = (() => {
    let v = "v0.0.1";
    return {
        get: () => v,
        set: (val) => {
            v = val;
            return v;
        }
    };
})();
const NetworkID = (() => {
    let v = "mitum";
    return {
        get: () => v,
        set: (val) => {
            v = val;
            return v;
        }
    };
})();
const getRangeConfig = (min, max) => {
    return {
        value: min == (max ?? min) ? min : undefined,
        min,
        max: max ?? min,
        satisfy: (target) => min <= target && target <= (max ?? min),
    };
};
const Config = {
    SUFFIX: {
        DEFAULT: getRangeConfig(3),
        ZERO_ADDRESS: getRangeConfig(5)
    },
    CURRENCY_ID: getRangeConfig(3, 10),
    CONTRACT_ID: getRangeConfig(3, 10),
    SEED: getRangeConfig(36, Number.MAX_SAFE_INTEGER),
    THRESHOLD: getRangeConfig(1, 100),
    WEIGHT: getRangeConfig(1, 100),
    ADDRESS: {
        DEFAULT: getRangeConfig(45),
        ZERO: getRangeConfig(8, 15),
        NODE: getRangeConfig(4, Number.MAX_SAFE_INTEGER),
    },
    CONTRACT_HANDLERS: getRangeConfig(0, 20),
    KEYS_IN_ACCOUNT: getRangeConfig(1, 100),
    AMOUNTS_IN_ITEM: getRangeConfig(1, 10),
    ITEMS_IN_FACT: getRangeConfig(1, 100),
    OP_SIZE: getRangeConfig(1, 262144),
    FACT_HASHES: getRangeConfig(1, 40),
    KEY: {
        MITUM: {
            PRIVATE: getRangeConfig(67),
            PUBLIC: getRangeConfig(69),
        }
    },
    NFT: {
        ROYALTY: getRangeConfig(0, 99),
        SHARE: getRangeConfig(0, 100),
        ADDRESS_IN_MINTER_WHITELIST: getRangeConfig(0, 20),
        SIGNERS_IN_SIGNERS: getRangeConfig(0, 10),
        HASH: getRangeConfig(1, 1024),
        URI: getRangeConfig(1, 1000),
    },
    CREDENTIAL: {
        ID: getRangeConfig(1, 20),
        VALUE: getRangeConfig(1, 1024),
        TEMPLATE_ID: getRangeConfig(1, 20),
        TEMPLATE_NAME: getRangeConfig(1, 20),
        DISPLAY_NAME: getRangeConfig(1, 20),
        SUBJECT_KEY: getRangeConfig(1, 20),
        DESCRIPTION: getRangeConfig(1, 1024),
    },
    TIMESTAMP: {
        PROJECT_ID: getRangeConfig(1, 10),
        DATA: getRangeConfig(1, 1024),
    },
    STO: {
        PARTITION: getRangeConfig(3, 10),
    },
    DAO: {
        ADDRESS_IN_WHITELIST: getRangeConfig(0, 10),
        QUORUM: getRangeConfig(1, 100),
        VOTE: getRangeConfig(0, 255),
    },
    STORAGE: {
        PROJECT: getRangeConfig(1, 10),
        DATA_KEY: getRangeConfig(1, 200),
        DATA_VALUE: getRangeConfig(1, 20000)
    }
};

var CURRENCY = {
    KEY: "mitum-currency-key",
    KEYS: "mitum-currency-keys",
    AMOUNT: "mitum-currency-amount",
    DESIGN: "mitum-currency-currency-design",
    POLICY: "mitum-currency-currency-policy",
    FEEER: {
        NIL: "mitum-currency-nil-feeer",
        FIXED: "mitum-currency-fixed-feeer",
        RATIO: "mitum-currency-ratio-feeer",
    },
    CREATE_ACCOUNT: {
        ITEM: "mitum-currency-create-account-multiple-amounts",
        FACT: "mitum-currency-create-account-operation-fact",
        OPERATION: "mitum-currency-create-account-operation",
    },
    UPDATE_KEY: {
        FACT: "mitum-currency-update-key-operation-fact",
        OPERATION: "mitum-currency-update-key-operation",
    },
    TRANSFER: {
        ITEM: "mitum-currency-transfer-item-multi-amounts",
        FACT: "mitum-currency-transfer-operation-fact",
        OPERATION: "mitum-currency-transfer-operation",
    },
    REGISTER_CURRENCY: {
        FACT: "mitum-currency-register-currency-operation-fact",
        OPERATION: "mitum-currency-register-currency-operation",
    },
    UPDATE_CURRENCY: {
        FACT: "mitum-currency-update-currency-operation-fact",
        OPERATION: "mitum-currency-update-currency-operation",
    },
    MINT: {
        ITEM: "mitum-currency-mint-item",
        FACT: "mitum-currency-mint-operation-fact",
        OPERATION: "mitum-currency-mint-operation",
    },
    CREATE_CONTRACT_ACCOUNT: {
        ITEM: "mitum-extension-create-contract-account-multiple-amounts",
        FACT: "mitum-extension-create-contract-account-operation-fact",
        OPERATION: "mitum-extension-create-contract-account-operation",
    },
    WITHDRAW: {
        ITEM: "mitum-extension-contract-account-withdraw-multi-amounts",
        FACT: "mitum-extension-withdraw-operation-fact",
        OPERATION: "mitum-extension-withdraw-operation",
    },
    UPDATE_HANDLER: {
        FACT: "mitum-extension-update-handler-operation-fact",
        OPERATION: "mitum-extension-update-handler-operation",
    },
    EXTENSION: {
        AUTHENTICATION: "mitum-extension-base-authentication",
        PROXY_PAYER: "mitum-extension-base-proxy-payer",
        SETTLEMENT: "mitum-extension-base-settlement"
    }
};

var NFT$1 = {
    SIGNER: "mitum-nft-signer",
    SIGNERS: "mitum-nft-signers",
    REGISTER_MODEL: {
        FACT: "mitum-nft-register-model-operation-fact",
        OPERATION: "mitum-nft-register-model-operation",
    },
    UPDATE_MODEL_CONFIG: {
        FACT: "mitum-nft-update-model-config-operation-fact",
        OPERATION: "mitum-nft-update-model-config-operation",
    },
    MINT: {
        FORM: "mitum-nft-mint-form",
        ITEM: "mitum-nft-mint-item",
        FACT: "mitum-nft-mint-operation-fact",
        OPERATION: "mitum-nft-mint-operation",
    },
    APPROVE_ALL: {
        ITEM: "mitum-nft-approve-all-item",
        FACT: "mitum-nft-approve-all-operation-fact",
        OPERATION: "mitum-nft-approve-all-operation",
    },
    APPROVE: {
        ITEM: "mitum-nft-approve-item",
        FACT: "mitum-nft-approve-operation-fact",
        OPERATION: "mitum-nft-approve-operation",
    },
    TRANSFER: {
        ITEM: "mitum-nft-transfer-item",
        FACT: "mitum-nft-transfer-operation-fact",
        OPERATION: "mitum-nft-transfer-operation",
    },
    ADD_SIGNATURE: {
        ITEM: "mitum-nft-add-signature-item",
        FACT: "mitum-nft-add-signature-operation-fact",
        OPERATION: "mitum-nft-add-signature-operation",
    }
};

var CREDENTIAL = {
    REGISTER_MODEL: {
        FACT: "mitum-credential-register-model-operation-fact",
        OPERATION: "mitum-credential-register-model-operation",
    },
    ADD_TEMPLATE: {
        FACT: "mitum-credential-add-template-operation-fact",
        OPERATION: "mitum-credential-add-template-operation",
    },
    ISSUE: {
        ITEM: "mitum-credential-issue-item",
        FACT: "mitum-credential-issue-operation-fact",
        OPERATION: "mitum-credential-issue-operation",
    },
    REVOKE: {
        ITEM: "mitum-credential-revoke-item",
        FACT: "mitum-credential-revoke-operation-fact",
        OPERATION: "mitum-credential-revoke-operation",
    },
};

var DAO$1 = {
    DESIGN: "mitum-dao-design",
    POLICY: "mitum-dao-policy",
    CALLDATA: {
        TRANSFER: "mitum-dao-transfer-calldata",
        GOVERNANCE: "mitum-dao-governance-calldata",
    },
    PROPOSAL: {
        CRYPTO: "mitum-dao-crypto-proposal",
        BIZ: "mitum-dao-biz-proposal",
    },
    WHITELIST: "mitum-dao-whitelist",
    REGISTER_MODEL: {
        FACT: "mitum-dao-register-model-operation-fact",
        OPERATION: "mitum-dao-register-model-operation",
    },
    UPDATE_MODEL_CONFIG: {
        FACT: "mitum-dao-update-model-config-operation-fact",
        OPERATION: "mitum-dao-update-model-config-operation",
    },
    PROPOSE: {
        FACT: "mitum-dao-propose-operation-fact",
        OPERATION: "mitum-dao-propose-operation",
    },
    CANCEL_PROPOSAL: {
        FACT: "mitum-dao-cancel-proposal-operation-fact",
        OPERATION: "mitum-dao-cancel-proposal-operation",
    },
    REGISTER: {
        FACT: "mitum-dao-register-operation-fact",
        OPERATION: "mitum-dao-register-operation",
    },
    PRE_SNAP: {
        FACT: "mitum-dao-pre-snap-operation-fact",
        OPERATION: "mitum-dao-pre-snap-operation",
    },
    POST_SNAP: {
        FACT: "mitum-dao-post-snap-operation-fact",
        OPERATION: "mitum-dao-post-snap-operation",
    },
    VOTE: {
        FACT: "mitum-dao-vote-operation-fact",
        OPERATION: "mitum-dao-vote-operation",
    },
    EXECUTE: {
        FACT: "mitum-dao-execute-operation-fact",
        OPERATION: "mitum-dao-execute-operation",
    }
};

var KYC$1 = {
    CREATE_SERVICE: {
        FACT: "mitum-kyc-create-service-operation-fact",
        OPERATION: "mitum-kyc-create-service-operation",
    },
    ADD_CONTROLLER: {
        ITEM: "mitum-kyc-add-controller-item",
        FACT: "mitum-kyc-add-controller-operation-fact",
        OPERATION: "mitum-kyc-add-controller-operation",
    },
    REMOVE_CONTROLLER: {
        ITEM: "mitum-kyc-remove-controller-item",
        FACT: "mitum-kyc-remove-controller-operation-fact",
        OPERATION: "mitum-kyc-remove-controller-operation",
    },
    ADD_CUSTOMER: {
        ITEM: "mitum-kyc-add-customer-item",
        FACT: "mitum-kyc-add-customer-operation-fact",
        OPERATION: "mitum-kyc-add-customer-operation",
    },
    UPDATE_CUSTOMER: {
        ITEM: "mitum-kyc-update-customers-item",
        FACT: "mitum-kyc-update-customers-operation-fact",
        OPERATION: "mitum-kyc-update-customers-operation",
    }
};

var STO$1 = {
    CREATE_SECURITY_TOKEN: {
        ITEM: "mitum-sto-create-security-token-item",
        FACT: "mitum-sto-create-security-token-operation-fact",
        OPERATION: "mitum-sto-create-security-token-operation",
    },
    ISSUE: {
        ITEM: "mitum-sto-issue-item",
        FACT: "mitum-sto-issue-operation-fact",
        OPERATION: "mitum-sto-issue-operation",
    },
    AUTHORIZE_OPERATOR: {
        ITEM: "mitum-sto-authorize-operator-item",
        FACT: "mitum-sto-authorize-operator-operation-fact",
        OPERATION: "mitum-sto-authorize-operator-operation",
    },
    REVOKE_OPERATOR: {
        ITEM: "mitum-sto-revoke-operator-item",
        FACT: "mitum-sto-revoke-operator-operation-fact",
        OPERATION: "mitum-sto-revoke-operator-operation",
    },
    SET_DOCUMENT: {
        FACT: "mitum-sto-set-document-operation-fact",
        OPERATION: "mitum-sto-set-document-operation",
    },
    TRANSFER_BY_PARTITION: {
        ITEM: "mitum-sto-transfer-by-partition-item",
        FACT: "mitum-sto-transfer-by-partition-operation-fact",
        OPERATION: "mitum-sto-transfer-by-partition-operation",
    },
    REDEEM: {
        ITEM: "mitum-sto-redeem-item",
        FACT: "mitum-sto-redeem-operation-fact",
        OPERATION: "mitum-sto-redeem-operation",
    },
};

var TIMESTAMP = {
    REGISTER_MODEL: {
        FACT: "mitum-timestamp-register-model-operation-fact",
        OPERATION: "mitum-timestamp-register-model-operation",
    },
    ISSUE: {
        FACT: "mitum-timestamp-issue-operation-fact",
        OPERATION: "mitum-timestamp-issue-operation",
    },
};

var TOKEN = {
    REGISTER_MODEL: {
        FACT: "mitum-token-register-model-operation-fact",
        OPERATION: "mitum-token-register-model-operation",
    },
    MINT: {
        FACT: "mitum-token-mint-operation-fact",
        OPERATION: "mitum-token-mint-operation",
    },
    TRANSFER: {
        FACT: "mitum-token-transfer-operation-fact",
        OPERATION: "mitum-token-transfer-operation",
    },
    TRANSFERS: {
        ITEM: "mitum-token-transfers-item",
        FACT: "mitum-token-transfers-operation-fact",
        OPERATION: "mitum-token-transfers-operation"
    },
    APPROVE: {
        FACT: "mitum-token-approve-operation-fact",
        OPERATION: "mitum-token-approve-operation",
    },
    APPROVES: {
        ITEM: "mitum-token-approves-item",
        FACT: "mitum-token-approves-operation-fact",
        OPERATION: "mitum-token-approves-operation",
    },
    BURN: {
        FACT: "mitum-token-burn-operation-fact",
        OPERATION: "mitum-token-burn-operation",
    },
    TRANSFER_FROM: {
        FACT: "mitum-token-transfer-from-operation-fact",
        OPERATION: "mitum-token-transfer-from-operation",
    },
    TRANSFERS_FROM: {
        ITEM: "mitum-token-transfers-from-item",
        FACT: "mitum-token-transfers-from-operation-fact",
        OPERATION: "mitum-token-transfers-from-operation",
    }
};

var POINT = {
    REGISTER_MODEL: {
        FACT: "mitum-point-register-model-operation-fact",
        OPERATION: "mitum-point-register-model-operation",
    },
    MINT: {
        FACT: "mitum-point-mint-operation-fact",
        OPERATION: "mitum-point-mint-operation",
    },
    TRANSFER: {
        FACT: "mitum-point-transfer-operation-fact",
        OPERATION: "mitum-point-transfer-operation",
    },
    TRANSFERS: {
        ITEM: "mitum-point-transfers-item",
        FACT: "mitum-point-transfers-operation-fact",
        OPERATION: "mitum-point-transfers-operation"
    },
    APPROVE: {
        FACT: "mitum-point-approve-operation-fact",
        OPERATION: "mitum-point-approve-operation",
    },
    APPROVES: {
        ITEM: "mitum-point-approves-item",
        FACT: "mitum-point-approves-operation-fact",
        OPERATION: "mitum-point-approves-operation",
    },
    BURN: {
        FACT: "mitum-point-burn-operation-fact",
        OPERATION: "mitum-point-burn-operation",
    },
    TRANSFER_FROM: {
        FACT: "mitum-point-transfer-from-operation-fact",
        OPERATION: "mitum-point-transfer-from-operation",
    },
    TRANSFERS_FROM: {
        ITEM: "mitum-point-transfers-from-item",
        FACT: "mitum-point-transfers-from-operation-fact",
        OPERATION: "mitum-point-transfers-from-operation",
    }
};

var STORAGE = {
    REGISTER_MODEL: {
        FACT: "mitum-storage-register-model-operation-fact",
        OPERATION: "mitum-storage-register-model-operation",
    },
    CREATE_DATA: {
        FACT: "mitum-storage-create-data-operation-fact",
        OPERATION: "mitum-storage-create-data-operation",
    },
    CREATE_DATAS: {
        ITEM: "mitum-storage-create-datas-item",
        FACT: "mitum-storage-create-datas-operation-fact",
        OPERATION: "mitum-storage-create-datas-operation",
    },
    DELETE_DATA: {
        FACT: "mitum-storage-delete-data-operation-fact",
        OPERATION: "mitum-storage-delete-data-operation",
    },
    UPDATE_DATA: {
        FACT: "mitum-storage-update-data-operation-fact",
        OPERATION: "mitum-storage-update-data-operation",
    },
    UPDATE_DATAS: {
        ITEM: "mitum-storage-update-datas-item",
        FACT: "mitum-storage-update-datas-operation-fact",
        OPERATION: "mitum-storage-update-datas-operation",
    },
};

var PAYMENT = {
    REGISTER_MODEL: {
        FACT: "mitum-payment-register-model-operation-fact",
        OPERATION: "mitum-payment-register-model-operation",
    },
    DEPOSIT: {
        FACT: "mitum-payment-deposit-operation-fact",
        OPERATION: "mitum-payment-deposit-operation",
    },
    UPDATE_ACCOUNT_SETTING: {
        FACT: "mitum-payment-update-account-setting-operation-fact",
        OPERATION: "mitum-payment-update-account-setting-operation",
    },
    WITHDRAW: {
        FACT: "mitum-payment-withdraw-operation-fact",
        OPERATION: "mitum-payment-withdraw-operation",
    },
    TRANSFER: {
        FACT: "mitum-payment-transfer-operation-fact",
        OPERATION: "mitum-payment-transfer-operation",
    }
};

var HINT = {
    FACT_SIGN: "base-fact-sign",
    CURRENCY,
    NFT: NFT$1,
    CREDENTIAL,
    DAO: DAO$1,
    KYC: KYC$1,
    STO: STO$1,
    TIMESTAMP,
    TOKEN,
    POINT,
    STORAGE,
    PAYMENT
};

const KEY = {
    MITUM: {
        PRIVATE: "fpr",
        PUBLIC: "fpu",
    },
};
const ADDRESS = {
    MITUM: "fca",
    NODE: "sas",
    ZERO: "-Xmca",
};
var SUFFIX = {
    KEY,
    ADDRESS,
};

class Hint {
    constructor(s) {
        this.s = s;
    }
    toString() {
        return `${this.s}-${Version.get()}`;
    }
}

let Token$1 = class Token {
    constructor(s) {
        Assert.check(s !== "", MitumError.detail(ECODE.INVALID_TOKEN, "empty token"));
        this.s = s;
    }
    static from(s) {
        return s instanceof Token ? s : new Token(s);
    }
    toBuffer() {
        return Buffer.from(this.s);
    }
    toString() {
        return Buffer.from(this.s, "utf8").toString("base64");
    }
};

class ID {
    constructor(s) {
        this.s = s;
    }
    equal(id) {
        return this.toString() === id.toString();
    }
    toBuffer() {
        return Buffer.from(this.s);
    }
    toString() {
        return this.s;
    }
}
class CurrencyID extends ID {
    constructor(s) {
        super(s);
        Assert.check(Config.CURRENCY_ID.satisfy(s.length), MitumError.detail(ECODE.INVALID_CURRENCY_ID, "currency id length out of range"));
        Assert.check(/^[A-Z0-9][A-Z0-9_\.\!\$\*\@]*[A-Z0-9]$/.test(s), MitumError.detail(ECODE.INVALID_CURRENCY_ID, "invalid currency id format"));
    }
    static from(s) {
        return s instanceof CurrencyID ? s : new CurrencyID(s);
    }
}

class Amount {
    constructor(currency, big) {
        this.hint = new Hint(HINT.CURRENCY.AMOUNT);
        this.currency = CurrencyID.from(currency);
        this.big = Big.from(big);
        Assert.check(this.big.big > 0, MitumError.detail(ECODE.INVALID_AMOUNT, "amount must be over zero"));
    }
    toBuffer() {
        return Buffer.concat([
            this.big.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            _hint: this.hint.toString(),
            currency: this.currency.toString(),
            amount: this.big.toString(),
        };
    }
}
class Fee {
    constructor(currency, big) {
        this.hint = new Hint(HINT.CURRENCY.AMOUNT);
        this.currency = CurrencyID.from(currency);
        this.big = Big.from(big);
        Assert.check(0 <= this.big.big, MitumError.detail(ECODE.INVALID_FACT, "fee must not be under zero"));
    }
    toBuffer() {
        return Buffer.concat([
            this.big.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            _hint: this.hint.toString(),
            currency: this.currency.toString(),
            amount: this.big.toString(),
        };
    }
}

const SortFunc = (a, b) => Buffer.compare(a.toBuffer(), b.toBuffer());

const sha256 = (msg) => Buffer.from(sha256$1.sha256(msg));
const sha3 = (msg) => Buffer.from(jsSha3.sha3_256.create().update(msg).digest());
const keccak256 = (msg) => Buffer.from(jsSha3.keccak256.create().update(msg).digest());
const getChecksum = (hex) => {
    const hexLower = hex.toLowerCase();
    const hash = keccak256(Buffer.from(hexLower, 'ascii')).toString('hex');
    let checksum = '';
    for (let i = 0; i < hexLower.length; i++) {
        if (parseInt(hash[i], 16) > 7) {
            checksum += hexLower[i].toUpperCase();
        }
        else {
            checksum += hexLower[i];
        }
    }
    return checksum;
};

const delegateUri = (delegateIP) => `${delegateIP}?uri=`;
const validatePositiveInteger = (val, name) => {
    if (!Number.isSafeInteger(val) || val < 0) {
        throw MitumError.detail(ECODE.INVALID_FLOAT, `${name} must be a integer >= 0`);
    }
};
const isNumberTuple = (arr) => {
    return Array.isArray(arr) && arr.length === 2 && typeof arr[0] === 'number' && typeof arr[1] === 'number';
};
const apiPathWithParams = (apiPath, limit, offset, reverse) => {
    let query1;
    let query2;
    let query3;
    if (limit !== undefined) {
        validatePositiveInteger(limit, "limit");
        query1 = `limit=${limit}`;
    }
    if (offset !== undefined) {
        validatePositiveInteger(offset, "offset");
        query2 = `offset=${offset}`;
    }
    if (reverse !== undefined) {
        if (reverse !== true) {
            throw MitumError.detail(ECODE.INVALID_TYPE, "reverse must be true(bool)");
        }
        query3 = `reverse=1`;
    }
    const query = [query1, query2, query3].filter(str => str !== undefined).join("&");
    return query == "" ? apiPath : apiPath + "?" + query;
};
const apiPathWithHashParams = (apiPath, factHash, limit, offset, reverse) => {
    let hash;
    let query1;
    let query2;
    let query3;
    if (factHash !== undefined) {
        if (typeof (factHash) !== "string") {
            throw MitumError.detail(ECODE.INVALID_TYPE, "factHash must be a string");
        }
        hash = `facthash=${factHash}`;
    }
    if (limit !== undefined) {
        validatePositiveInteger(limit, "limit");
        query1 = `limit=${limit}`;
    }
    if (offset !== undefined) {
        validatePositiveInteger(offset, "offset");
        query2 = `offset=${offset}`;
    }
    if (reverse !== undefined) {
        if (reverse !== true) {
            throw MitumError.detail(ECODE.INVALID_TYPE, "reverse must be true(bool)");
        }
        query3 = `reverse=1`;
    }
    const query = [hash, query1, query2, query3].filter(str => str !== undefined).join("&");
    return query == "" ? apiPath : apiPath + "?" + query;
};
const apiPathWithParamsExt = (apiPath, limit, offset, reverse) => {
    let query1;
    let query2;
    let query3;
    if (limit !== undefined) {
        validatePositiveInteger(limit, "limit");
        query1 = `limit=${limit}`;
    }
    if (offset !== undefined) {
        if (!isNumberTuple(offset)) {
            throw MitumError.detail(ECODE.INVALID_TYPE, "offset must be a tuple with number");
        }
        validatePositiveInteger(offset[0], "offset element");
        validatePositiveInteger(offset[1], "offset element");
        query2 = `offset=${offset[0]},${offset[1]}`;
    }
    if (reverse !== undefined) {
        if (reverse !== true) {
            throw MitumError.detail(ECODE.INVALID_TYPE, "reverse must be true(bool)");
        }
        query3 = `reverse=1`;
    }
    const query = [query1, query2, query3].filter(str => str !== undefined).join("&");
    return query == "" ? apiPath : apiPath + "?" + query;
};

const calculateAllowance = (response, owner, approved) => {
    let amount = '0';
    if (response.data.policy && response.data.policy.approve_list) {
        const approveList = response.data.policy.approve_list;
        const approval = approveList.find(item => item.account === owner);
        if (approval) {
            const allowance = approval.approved.find(item => item.account === approved);
            if (allowance) {
                amount = allowance.amount;
            }
        }
        return { 'amount': amount };
    }
    else {
        throw MitumError.detail(ECODE.UNKNOWN, `Unknown error orccur: token policy or policy.approve_list does not exist`);
    }
};
const convertToArray = (contracts, length) => {
    if (typeof contracts === "string") {
        return Array(length).fill(contracts);
    }
    else if (Array.isArray(contracts)) {
        if (contracts.length !== length) {
            throw MitumError.detail(ECODE.INVALID_LENGTH, `length of contracts must be the same as length of the other array.`);
        }
        return contracts;
    }
    else {
        throw MitumError.detail(ECODE.INVALID_TYPE, `contracts must be a string or an array.`);
    }
};

class Item {
    constructor(hint) {
        this.hint = new Hint(hint);
    }
    toHintedObject() {
        return {
            _hint: this.hint.toString()
        };
    }
}

class FactSign {
    constructor(signer, signature, signedAt) {
        this.signature = signature;
        this.signedAt = new FullTimeStamp(signedAt);
        this.signer = Key.from(signer);
        Assert.get(this.signer.isPriv, MitumError.detail(ECODE.INVALID_PUBLIC_KEY, "not public key")).not().excute();
    }
    toBuffer() {
        return Buffer.concat([
            this.signer.toBuffer(),
            this.signature,
            this.signedAt.toBuffer("super")
        ]);
    }
    toHintedObject() {
        return {
            signer: this.signer.toString(),
            signature: base58.encode(this.signature),
            signed_at: this.signedAt.ISO(),
        };
    }
}
class GeneralFactSign extends FactSign {
    constructor(signer, signature, signedAt) {
        super(signer, signature, signedAt);
    }
    toHintedObject() {
        return super.toHintedObject();
    }
}
class NodeFactSign extends FactSign {
    constructor(node, signer, signature, signedAt) {
        super(signer, signature, signedAt);
        this.node = NodeAddress.from(node);
    }
    toBuffer() {
        return Buffer.concat([
            this.node.toBuffer(),
            super.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            node: this.node.toString(),
        };
    }
}

let Operation$1 = class Operation {
    constructor(networkID, fact) {
        this.id = networkID;
        this.fact = fact;
        this.hint = new Hint(fact.operationHint);
        this._factSigns = [];
        this._hash = Buffer.from([]);
    }
    setFactSigns(factSigns) {
        if (!factSigns) {
            return;
        }
        Assert.check(new Set(factSigns.map(fs => fs.signer.toString())).size === factSigns.length, MitumError.detail(ECODE.INVALID_FACTSIGNS, "duplicate signers found in factsigns"));
        this._factSigns = factSigns;
        this._hash = this.hashing();
    }
    get factSigns() {
        return this._factSigns;
    }
    get hash() {
        return this._hash;
    }
    get factSignType() {
        return this.getSigType();
    }
    getSigType(factSigns) {
        if (!factSigns) {
            factSigns = this._factSigns;
        }
        if (factSigns.length === 0) {
            return null;
        }
        const set = new Set(factSigns.map(fs => Object.getPrototypeOf(fs).constructor.name));
        Assert.check(set.size === 1, MitumError.detail(ECODE.INVALID_FACTSIGNS, "multiple sig-type in operation"));
        return Array.from(set)[0];
    }
    hashing(force) {
        let b = sha3(this.toBuffer());
        if (force && force === "force") {
            this._hash = b;
        }
        return b;
    }
    sign(privateKey, option) {
        privateKey = Key.from(privateKey);
        const keypair = KeyPair.fromPrivateKey(privateKey);
        const sigType = this.factSignType;
        if (sigType === "NodeFactSign") {
            Assert.check(option !== undefined, MitumError.detail(ECODE.FAIL_SIGN, "no node address in sign option"));
        }
        const factSign = this.signWithSigType(sigType, keypair, option ? new NodeAddress(option.node ?? "") : undefined);
        const idx = this._factSigns
            .map((fs) => fs.signer.toString())
            .indexOf(keypair.publicKey.toString());
        if (idx < 0) {
            this._factSigns.push(factSign);
        }
        else {
            this._factSigns[idx] = factSign;
        }
        this._hash = this.hashing();
    }
    signWithSigType(sigType, keypair, node) {
        const getFactSign = (keypair, hash) => {
            const now = TimeStamp$1.new();
            return new GeneralFactSign(keypair.publicKey, keypair.sign(Buffer.concat([Buffer.from(this.id), hash, now.toBuffer()])), now.toString());
        };
        const getNodeFactSign = (node, keypair, hash) => {
            const now = TimeStamp$1.new();
            return new NodeFactSign(node.toString(), keypair.publicKey, keypair.sign(Buffer.concat([
                Buffer.from(this.id),
                node.toBuffer(),
                hash,
                now.toBuffer(),
            ])), now.toString());
        };
        const hash = this.fact.hash;
        if (sigType) {
            if (sigType == "NodeFactSign") {
                Assert.check(node !== undefined, MitumError.detail(ECODE.FAIL_SIGN, "no node address"));
                return getNodeFactSign(node, keypair, hash);
            }
            return getFactSign(keypair, hash);
        }
        else {
            if (node) {
                return getNodeFactSign(node, keypair, hash);
            }
            return getFactSign(keypair, hash);
        }
    }
    toBuffer() {
        if (!this._factSigns) {
            return this.fact.hash;
        }
        this._factSigns = this._factSigns.sort(SortFunc);
        return Buffer.concat([
            this.fact.hash,
            Buffer.concat(this._factSigns.map((fs) => fs.toBuffer())),
        ]);
    }
    toHintedObject() {
        const operation = {
            _hint: this.hint.toString(),
            fact: this.fact.toHintedObject(),
            hash: this._hash.length === 0 ? "" : base58.encode(this._hash)
        };
        const factSigns = this._factSigns.length === 0 ? [] : this._factSigns.sort(SortFunc);
        return {
            ...operation,
            signs: factSigns.map(fs => fs.toHintedObject())
        };
    }
};

// import base58 from "bs58"
//type FactSign = GeneralFactSign | NodeFactSign
class Authentication {
    constructor(contract, authenticationId, proofData) {
        this.hint = new Hint(HINT.CURRENCY.EXTENSION.AUTHENTICATION);
        this.contract = Address.from(contract);
        this.authenticationId = authenticationId;
        if (proofData) {
            Assert.check(isBase58Encoded(proofData), MitumError.detail(ECODE.INVALID_USER_OPERATION, `proof_data must in base58 encoded`));
        }
        this.proofData = proofData ? proofData : "";
    }
    toHintedObject() {
        return {
            _hint: this.hint.toString(),
            contract: this.contract.toString(),
            authentication_id: this.authenticationId,
            proof_data: this.proofData,
        };
    }
}
class ProxyPayer {
    constructor(proxyPayer) {
        this.hint = new Hint(HINT.CURRENCY.EXTENSION.PROXY_PAYER);
        this.proxyPayer = Address.from(proxyPayer);
    }
    toHintedObject() {
        return {
            _hint: this.hint.toString(),
            proxy_payer: this.proxyPayer.toString(),
        };
    }
}
class Settlement {
    constructor(opSender) {
        this.hint = new Hint(HINT.CURRENCY.EXTENSION.SETTLEMENT);
        this.opSender = opSender ? Address.from(opSender) : "";
    }
    toHintedObject() {
        return {
            _hint: this.hint.toString(),
            op_sender: this.opSender.toString(),
        };
    }
}
// class RestoredFact extends Fact {
//     readonly _hash: Buffer;
//     readonly factJson: FactJson;
//     readonly sender: Address;
//     constructor(factJson: FactJson) {
//         const token_seed = Buffer.from(factJson.token, "base64").toString("utf8");
//         const parts = factJson._hint.split('-');
//         super(parts.slice(0, parts.length - 1).join('-'), token_seed);
//         this.factJson = factJson;
//         this.sender = new Address(factJson.sender);
//         this._hash = factJson.hash ? this.hashing() : Buffer.from([]);
//     }
//     get operationHint(): string {
//         const parts = this.factJson._hint.split('-');
//         return parts.slice(0, parts.length - 2).join('-');
//     }
//     toHintedObject(): FactJson {
//         return this.factJson;
//     }
//     hashing(): Buffer {
//         return this.factJson.hash ? Buffer.from(base58.decode(this.factJson.hash)) : Buffer.from([]);
//     }
// }
// export class UserOperation<T extends Fact> extends Operation<T> {
//     readonly id: string
//     readonly hint: Hint
//     readonly fact: T
//     protected auth: Authentication
//     protected proxyPayer: null | ProxyPayer
//     protected settlement: Settlement
//     protected _factSigns: FactSign[]
//     protected _hash: Buffer
//     constructor(
//         networkID: string,
//         fact: T | FactJson,
//         auth: Authentication,
//         proxyPayer: null | ProxyPayer,
//         settlement: Settlement
//     ) {
//         super(networkID, (!isFactJson(fact) ? fact : UserOperation.restoreFactFromJson<T>(fact)) as T);
//         this.id = networkID;
//         this.fact = (!isFactJson(fact) ? fact : UserOperation.restoreFactFromJson<T>(fact)) as T;
//         if ("sender" in fact) {
//             this.isSenderDidOwner(fact.sender, auth.authenticationId, true);
//         };
//         this.auth = auth;
//         this.proxyPayer = proxyPayer;
//         this.settlement = settlement;
//         this.hint = new Hint(this.fact.operationHint);
//         this._factSigns = [];
//         this._hash = this.hashing();
//     }
//     static restoreFactFromJson<T extends Fact>(factJson: FactJson): T {
//         const fact = new RestoredFact(factJson);
//         return fact as unknown as T;
//     }
//     get hash() {
//         return this._hash
//     }
//     toBuffer(): Buffer {
//         if (!this._factSigns) {
//             return this.fact.hash
//         }
//         this._factSigns = this._factSigns.sort(SortFunc);
//         return Buffer.concat([
//             Buffer.from(JSON.stringify(this.toHintedExtension())),
//             this.fact.hash,
//             Buffer.concat(this._factSigns.map((fs) => fs.toBuffer())),
//         ])
//     }
//     toHintedObject(): HintedObject {
//         const operation = {
//             _hint: this.hint.toString(),
//             fact: this.fact.toHintedObject(),
//             extension: this.proxyPayer ? 
//             {
//                 authentication: this.auth.toHintedObject(),
//                 proxy_payer: this.proxyPayer.toHintedObject(),
//                 settlement: this.settlement.toHintedObject(),
//             } :
//             {
//                 authentication: this.auth.toHintedObject(),
//                 settlement: this.settlement.toHintedObject(),
//             },
//             hash: this._hash.length === 0 ? "" : base58.encode(this._hash)
//         }
//         const factSigns = this._factSigns.length === 0 ? [] : this._factSigns.sort(SortFunc);
//         return {
//             ...operation,
//             signs: factSigns.map(fs => fs.toHintedObject())
//         }
//     }
//     private toHintedExtension(): HintedExtensionObject {
//         return this.proxyPayer ? 
//             {
//                 authentication: this.auth.toHintedObject(),
//                 proxy_payer: this.proxyPayer.toHintedObject(),
//                 settlement: this.settlement.toHintedObject(),
//             } :
//             {
//                 authentication: this.auth.toHintedObject(),
//                 settlement: this.settlement.toHintedObject(),
//             }
//     }
//     private isSenderDidOwner(sender: string | Address, did: string, id?: true) {
//         Assert.check(
//             sender.toString() === validateDID(did.toString(), id).toString(),
//             MitumError.detail(ECODE.AUTH_DID.INVALID_DID, `The owner of did must match the sender(${sender.toString()}). check the did (${did.toString()})`)
//         );
//     }
// 	/**
// 	 * Add alternative signature for userOperation, fill `proof_data` item of `authentication` object.
// 	 * @param {string | Key | KeyPair} [privateKey] - The private key or key pair for signing.
// 	 * @returns void
// 	 */
//     // addAlterSign(privateKey: string | Key, type?: "ed25519" | "ecdsa") {
//     addAlterSign(privateKey: string | Key): void {
//         privateKey = Key.from(privateKey);
//         const keypair = KeyPair.fromPrivateKey<KeyPair>(privateKey);
//         const alterSign = keypair.sign(Buffer.from(this.fact.hash));
//         this.auth = new Authentication(this.auth.contract, this.auth.authenticationId, base58.encode(alterSign)); // base58 인코딩 후 저장
//     }
//     /**
//      * Updates the settlement details of a userOperation.
//      * @param {string | Address} opSender - The opseration sender's address (Bundler's address).
//      * @returns void.
//      **/
//     setSettlement(opSender: string | Address): void {
//         Address.from(opSender);
//         this.settlement = new Settlement(opSender);
//     }
//     /**
//      * Updates the proxy payer details of a userOperation.
//      * @param {string | Address} proxyPayer - The proxy payer's address. (address of CA)
//      * @returns void.
//      **/
//     setProxyPayer(proxyPayer: string | Address): void {
//         Address.from(proxyPayer);
//         this.proxyPayer = new ProxyPayer(proxyPayer);
//     }
//     /**
//      * Sign the given userOperation in JSON format using given private key.
// 	 * @param {string | Key} [privatekey] - The private key used for signing.
// 	 * @returns void.
//      */
//     sign(privatekey: string | Key) {
//         const userOperationFields = {
//             contract: this.auth.contract.toString(),
//             authentication_id : this.auth.authenticationId,
//             proof_data: this.auth.proofData,
//             op_sender: this.settlement.opSender.toString(),
//         };
//         Object.entries(userOperationFields).forEach(([key, value]) => {
//             StringAssert.with(value, MitumError.detail(ECODE.INVALID_USER_OPERATION,
//                 `Cannot sign the user operation: ${key} must not be empty.`)).empty().not().excute();
//         });
//         const keypair = KeyPair.fromPrivateKey(privatekey);
//         const now = TimeStamp.new();
//         const factSign = new GeneralFactSign(
//             keypair.publicKey,
//             keypair.sign(Buffer.concat([Buffer.from(this.id), this.fact.hash, now.toBuffer()])),
//             now.toString(),
//         );
//         const idx = this._factSigns
//             .map((fs) => fs.signer.toString())
//             .indexOf(keypair.publicKey.toString());
//         if (idx < 0) {
//             this._factSigns.push(factSign);
//         } else {
//             this._factSigns[idx] = factSign;
//         }
//         this._hash = this.hashing();
//     }
//     // export(filePath: string) {
//     //     writeFile(filePath, JSON.stringify(this.toHintedObject(), null, 4), (e) => {
//     //         if (e) {
//     //             throw MitumError.detail(ECODE.FAIL_FILE_CREATION, "fs write-file failed")
//     //         }
//     //     })
//     // }
// }

// import { Address } from "../../key"
class ContractGenerator extends Generator {
    constructor(networkID, api, delegateIP) {
        super(networkID, api, delegateIP);
    }
}

class Fact {
    constructor(hint, token) {
        this.hint = new Hint(hint);
        this.token = new Token$1(token);
        this._hash = Buffer.from([]);
    }
    get hash() {
        return this._hash;
    }
    hashing() {
        return sha3(this.toBuffer());
    }
    toBuffer() {
        return this.token.toBuffer();
    }
    toHintedObject() {
        return {
            _hint: this.hint.toString(),
            hash: base58.encode(this.hash ? this.hash : []),
            token: this.token.toString()
        };
    }
}
class OperationFact extends Fact {
    constructor(hint, token, sender, items) {
        super(hint, token);
        this.sender = Address.from(sender);
        Assert.check(Config.ITEMS_IN_FACT.satisfy(items.length), MitumError.detail(ECODE.INVALID_ITEMS, "length of items is out of range"));
        if (hint !== HINT.NFT.MINT.FACT) {
            Assert.check(new Set(items.map(i => i.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate items found"));
        }
        this.items = items;
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.sender.toBuffer(),
            Buffer.concat(this.items.sort(SortFunc).map((i) => i.toBuffer())),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            sender: this.sender.toString(),
            items: this.items.sort(SortFunc).map(i => i.toHintedObject()),
        };
    }
}
class ContractFact extends Fact {
    constructor(hint, token, sender, contract, currency) {
        super(hint, token);
        this.sender = Address.from(sender);
        this.contract = Address.from(contract);
        this.currency = CurrencyID.from(currency);
        Assert.check(this.sender.toString() !== this.contract.toString(), MitumError.detail(ECODE.INVALID_FACT, "sender is same with contract address"));
        // this._hash = this.hashing()
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.sender.toBuffer(),
            this.contract.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            sender: this.sender.toString(),
            contract: this.contract.toString(),
            currency: this.currency.toString(),
        };
    }
}
class NodeFact extends Fact {
    constructor(hint, token) {
        super(hint, token);
    }
}

const isOpFact = (operation) => {
    return operation instanceof Operation$1;
};
const isHintedObject = (object) => {
    return '_hint' in object && 'fact' in object && 'hash' in object;
};
const isHintedObjectFromUserOp = (object) => {
    if ('_hint' in object &&
        'fact' in object &&
        'hash' in object &&
        'extension' in object) {
        const { authentication, settlement, proxy_payer } = object.extension;
        return ('_hint' in authentication &&
            'contract' in authentication &&
            'authentication_id' in authentication &&
            'proof_data' in authentication &&
            '_hint' in settlement &&
            'op_sender' in settlement &&
            (proxy_payer ? '_hint' in proxy_payer && 'proxy_payer' in proxy_payer : true));
    }
    return false;
};
const isSuccessResponse = (response) => {
    return 'data' in response;
};
const isBase58Encoded = (value) => {
    if (!value || typeof value !== 'string') {
        return false;
    }
    const base58Chars = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
    return base58Chars.test(value);
};

class BaseAddress {
    constructor(s, type) {
        this.s = s;
        if (type) {
            this.type = type;
        }
        else if (this.s.endsWith(SUFFIX.ADDRESS.MITUM)) {
            this.type = "mitum";
        }
        else if (this.s.endsWith(SUFFIX.ADDRESS.NODE)) {
            this.type = "node";
        }
        else if (this.s.endsWith(SUFFIX.ADDRESS.ZERO)) {
            this.type = "zero";
        }
        else {
            throw MitumError.detail(ECODE.INVALID_ADDRESS, "address type not detected");
        }
    }
    toBuffer() {
        return Buffer.from(this.s);
    }
    toString() {
        return this.s;
    }
}
class Address extends BaseAddress {
    constructor(s) {
        super(s);
        StringAssert.with(s, MitumError.detail(ECODE.INVALID_ADDRESS_TYPE, `The address must be starting with '0x' and ending with '${SUFFIX.ADDRESS.MITUM}'`))
            .startsWith('0x')
            .endsWith(SUFFIX.ADDRESS.MITUM)
            .excute();
        StringAssert.with(s, MitumError.detail(ECODE.INVALID_ADDRESS, "The address must be a 45-character string"))
            .empty().not()
            .satisfyConfig(Config.ADDRESS.DEFAULT)
            .excute();
        Assert.check(/^[0-9a-fA-F]+$/.test(s.slice(2, 42)), MitumError.detail(ECODE.INVALID_ADDRESS, `${s.slice(2, 42)} is not a hexadecimal number`));
        StringAssert.with(s, MitumError.detail(ECODE.INVALID_ADDRESS_CHECKSUM, "bad address checksum"))
            .equal('0x' + getChecksum(s.slice(2, 42)) + SUFFIX.ADDRESS.MITUM)
            .excute();
    }
    static from(s) {
        return s instanceof Address ? s : new Address(s);
    }
}
class NodeAddress extends BaseAddress {
    constructor(s) {
        super(s, "node");
        StringAssert.with(s, MitumError.detail(ECODE.INVALID_ADDRESS, "invalid node address"))
            .empty().not()
            .endsWith(SUFFIX.ADDRESS.NODE)
            .satisfyConfig(Config.ADDRESS.NODE)
            .excute();
    }
    static from(s) {
        return s instanceof NodeAddress ? s : new NodeAddress(s);
    }
}
class ZeroAddress extends BaseAddress {
    constructor(s) {
        super(s, "zero");
        StringAssert.with(s, MitumError.detail(ECODE.INVALID_ADDRESS, "invalid zero address"))
            .empty().not()
            .endsWith(SUFFIX.ADDRESS.ZERO)
            .satisfyConfig(Config.ADDRESS.ZERO)
            .excute();
        this.currency = new CurrencyID(s.substring(0, s.length - Config.SUFFIX.ZERO_ADDRESS.value));
    }
    static from(s) {
        return s instanceof ZeroAddress ? s : new ZeroAddress(s);
    }
}

class Key {
    constructor(s) {
        StringAssert.with(s, MitumError.detail(ECODE.INVALID_KEY, "invalid key"))
            .empty().not()
            .chainOr(s.endsWith(SUFFIX.KEY.MITUM.PRIVATE), s.endsWith(SUFFIX.KEY.MITUM.PUBLIC))
            .excute();
        if (s.endsWith(SUFFIX.KEY.MITUM.PRIVATE)) {
            StringAssert.with(s, MitumError.detail(ECODE.INVALID_PRIVATE_KEY, "invalid private key"))
                .chainAnd(s.endsWith(SUFFIX.KEY.MITUM.PRIVATE) && Config.KEY.MITUM.PRIVATE.satisfy(s.length), /^[0-9a-f]+$/.test(s.substring(0, s.length - Config.SUFFIX.DEFAULT.value)))
                .excute();
        }
        else {
            StringAssert.with(s, MitumError.detail(ECODE.INVALID_PUBLIC_KEY, "invalid public key"))
                .chainAnd(s.endsWith(SUFFIX.KEY.MITUM.PUBLIC) && Config.KEY.MITUM.PUBLIC.satisfy(s.length), /^[0-9a-f]+$/.test(s.substring(0, s.length - Config.SUFFIX.DEFAULT.value)))
                .excute();
        }
        this.key = s.substring(0, s.length - Config.SUFFIX.DEFAULT.value);
        this.suffix = s.substring(s.length - Config.SUFFIX.DEFAULT.value);
        this.type = "mitum";
        this.isPriv = s.endsWith(SUFFIX.KEY.MITUM.PRIVATE);
    }
    static from(s) {
        return s instanceof Key ? s : new Key(s);
    }
    get noSuffix() {
        return this.key;
    }
    toBuffer() {
        return Buffer.from(this.toString());
    }
    toString() {
        return this.key + this.suffix;
    }
}
class PubKey extends Key {
    constructor(key, weight) {
        super(typeof key === "string" ? key : key.toString());
        this.weight = Big.from(weight);
        const s = key.toString();
        StringAssert.with(s, MitumError.detail(ECODE.INVALID_PUBLIC_KEY, "invalid public key"))
            .chainAnd(s.endsWith(SUFFIX.KEY.MITUM.PUBLIC))
            .excute();
        Assert.check(Config.WEIGHT.satisfy(this.weight.v), MitumError.detail(ECODE.INVALID_PUBLIC_KEY, "weight out of range"));
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.weight.toBuffer("fill")
        ]);
    }
    toHintedObject() {
        return {
            _hint: PubKey.hint.toString(),
            weight: this.weight.v,
            key: this.toString(),
        };
    }
}
PubKey.hint = new Hint(HINT.CURRENCY.KEY);
class Keys {
    constructor(keys, threshold) {
        Assert.check(Config.KEYS_IN_ACCOUNT.satisfy(keys.length), MitumError.detail(ECODE.INVALID_KEYS, "keys length out of range"));
        this._keys = keys.map(k => {
            if (k instanceof PubKey) {
                return k;
            }
            const [key, weight] = k;
            return new PubKey(key instanceof Key ? key.toString() : key, weight);
        });
        this.threshold = threshold instanceof Big ? threshold : new Big(threshold);
        const _sum = this._keys.reduce((total, key) => total + key.weight.v, 0);
        Assert.check(this.threshold.v <= _sum, MitumError.detail(ECODE.INVALID_KEYS, `sum of weights under threshold, ${_sum} < ${this.threshold.v}`));
        Assert.check(Config.THRESHOLD.satisfy(this.threshold.v), MitumError.detail(ECODE.INVALID_KEYS, "threshold out of range"));
        Assert.check(new Set(this._keys.map(k => k.toString())).size === this._keys.length, MitumError.detail(ECODE.INVALID_KEYS, "duplicate keys found in keys"));
    }
    get keys() {
        return this._keys;
    }
    get checksum() {
        const address = keccak256(this.toBuffer()).subarray(12).toString('hex');
        const hash = keccak256(Buffer.from(address, 'ascii')).toString('hex');
        let checksumAddress = '0x';
        for (let i = 0; i < address.length; i++) {
            if (parseInt(hash[i], 16) > 7) {
                checksumAddress += address[i].toUpperCase();
            }
            else {
                checksumAddress += address[i];
            }
        }
        // use mitum SUFFIX temporarily
        return new Address(checksumAddress + SUFFIX.ADDRESS.MITUM);
    }
    toBuffer() {
        return Buffer.concat([
            Buffer.concat(this._keys.sort((a, b) => Buffer.compare(Buffer.from(a.toString()), Buffer.from(b.toBuffer()))).map(k => k.toBuffer())),
            this.threshold.toBuffer("fill")
        ]);
    }
    toHintedObject() {
        const eHash = jsSha3.keccak256(this.toBuffer());
        return {
            _hint: Keys.hint.toString(),
            hash: eHash.slice(24),
            keys: this._keys
                .sort((a, b) => Buffer.compare(Buffer.from(a.toString()), Buffer.from(b.toBuffer())))
                .map((k) => k.toHintedObject()),
            threshold: this.threshold.v,
        };
    }
}
Keys.hint = new Hint(HINT.CURRENCY.KEYS);

const defaultPath = "m/44'/815'/0'/0/0";

const privateKeyToPublicKey = (privateKey) => {
    let privateBuf;
    if (!Buffer.isBuffer(privateKey)) {
        if (typeof privateKey !== "string") {
            throw MitumError.detail(ECODE.INVALID_TYPE, "Expected Buffer or string as argument");
        }
        privateKey = privateKey.slice(0, 2) === "0x" ? privateKey.slice(2) : privateKey;
        privateBuf = Buffer.from(privateKey, "hex");
    }
    else {
        privateBuf = privateKey;
    }
    return secp256k1.getPublicKey(privateBuf, false);
};
const compress = (publicKey) => {
    const xCoordinate = publicKey.slice(1, 33);
    const yCoordinate = publicKey.slice(33);
    const compressedPublicKey = Buffer.concat([
        Buffer.from([0x02 + (yCoordinate[yCoordinate.length - 1] % 2)]),
        xCoordinate,
    ]);
    return compressedPublicKey.toString("hex");
};

class BaseKeyPair {
    constructor(privateKey) {
        this.privateKey = privateKey;
        this.signer = this.getSigner();
        this.publicKey = this.getPub();
        secp256k1__namespace.utils.hmacSha256Sync = (key, ...msgs) => hmac.hmac(sha256$1.sha256, key, secp256k1__namespace.utils.concatBytes(...msgs));
        secp256k1__namespace.utils.sha256Sync = (...msgs) => sha256$1.sha256(secp256k1__namespace.utils.concatBytes(...msgs));
    }
    static random(option) {
        return this.generator.random(option);
    }
    static fromSeed(seed, option) {
        return this.generator.fromSeed(seed, option);
    }
    static fromPrivateKey(key) {
        const s = key.toString();
        StringAssert.with(s, MitumError.detail(ECODE.INVALID_PRIVATE_KEY, "invalid private key"))
            .chainAnd(s.endsWith(SUFFIX.KEY.MITUM.PRIVATE)).excute();
        return this.generator.fromPrivateKey(key);
    }
    static hdRandom(option) {
        return this.generator.hdRandom(option);
    }
    static fromPhrase(phrase, path, option) {
        return this.generator.fromPhrase(phrase, path, option);
    }
    ethSign(msg) {
        const ec = new elliptic.ec("secp256k1");
        const key = ec.keyFromPrivate(this.privateKey.noSuffix, "hex");
        const msgHash = crypto__namespace.createHash("sha256").update(msg).digest();
        const signature = key.sign(msgHash);
        const r = Buffer.from(signature.r.toArray());
        const s = Buffer.from(signature.s.toArray());
        const sigLength = 4 + r.length + s.length;
        const sigBuffer = Buffer.alloc(sigLength);
        sigBuffer.writeUInt32LE(r.length, 0);
        sigBuffer.set(r, 4);
        sigBuffer.set(s, 4 + r.length);
        return sigBuffer;
    }
    ethVerify(sig, msg) {
        if (typeof sig === "string") {
            sig = Buffer.from(base58.decode(sig));
        }
        const rlen = new Big(sig.subarray(0, 4).reverse());
        const r = Buffer.alloc(rlen.v);
        const rb = new Big(sig.subarray(4, 4 + rlen.v));
        rb.toBuffer().copy(r, rlen.v - rb.byteLen());
        const s = sig.subarray(4 + rlen.v);
        const slen = new Big(s.length);
        const base = Buffer.from([48, sig.length, 2]);
        const buf = Buffer.alloc(sig.length + 2);
        base.copy(buf, 0, 0, 4);
        rlen.toBuffer().copy(buf, 3);
        r.copy(buf, 4);
        Buffer.from([2]).copy(buf, 4 + rlen.v);
        slen.toBuffer().copy(buf, 5 + rlen.v);
        s.copy(buf, 6 + rlen.v);
        return secp256k1__namespace.verify(buf, sha256(msg), secp256k1__namespace.getPublicKey(this.signer, true));
    }
    static K(seed) {
        seed = Buffer.from(base58.encode(sha3(Buffer.from(seed))));
        Assert.check(40 <= seed.length, MitumError.detail(ECODE.INVALID_SEED, "seed length out of range"));
        seed = seed.subarray(0, 40);
        const N = secp256k1__namespace.CURVE.n - BigInt(1);
        let k = new Big(seed).big;
        k %= N;
        k += BigInt(1);
        return k;
    }
}
class KeyPair extends BaseKeyPair {
    constructor(privateKey) {
        super(Key.from(privateKey));
    }
    getSigner() {
        return Buffer.from(this.privateKey.noSuffix, "hex");
    }
    getPub() {
        const publickeyBuffer = privateKeyToPublicKey("0x" + this.privateKey.noSuffix);
        return new Key(compress(publickeyBuffer) + SUFFIX.KEY.MITUM.PUBLIC);
    }
    sign(msg) {
        return this.ethSign(msg);
    }
    verify(sig, msg) {
        return this.ethVerify(sig, msg);
    }
}
KeyPair.generator = {
    fillHDAccount(kp, wallet) {
        return {
            privatekey: kp.privateKey.toString(),
            publickey: kp.publicKey.toString(),
            address: "",
            phrase: wallet.mnemonic?.phrase,
            path: wallet.path
        };
    },
    random() {
        return new KeyPair(ethers.Wallet.createRandom().privateKey.substring(2) + SUFFIX.KEY.MITUM.PRIVATE);
    },
    fromSeed(seed) {
        StringAssert.with(seed, MitumError.detail(ECODE.INVALID_SEED, "seed length out of range"))
            .satisfyConfig(Config.SEED)
            .excute();
        return new KeyPair(BaseKeyPair.K(seed).toString(16) + SUFFIX.KEY.MITUM.PRIVATE);
    },
    fromPrivateKey(key) {
        return new KeyPair(key);
    },
    hdRandom() {
        try {
            const wallet = ethers.HDNodeWallet.createRandom("", defaultPath);
            const kp = new KeyPair(wallet.privateKey.substring(2) + SUFFIX.KEY.MITUM.PRIVATE);
            return this.fillHDAccount(kp, wallet);
        }
        catch (error) {
            Assert.check(false, MitumError.detail(ECODE.UNKNOWN, `unknown error occur during HDNodeWallet.createRandom(), ${error.shortMessage}`));
            throw error;
        }
    },
    fromPhrase(phrase, path) {
        try {
            const wallet = ethers.HDNodeWallet.fromPhrase(phrase, "", path ? path : defaultPath);
            const kp = new KeyPair(wallet.privateKey.substring(2) + SUFFIX.KEY.MITUM.PRIVATE);
            return this.fillHDAccount(kp, wallet);
        }
        catch (error) {
            if (error.argument === 'mnemonic') {
                Assert.check(false, MitumError.detail(ECODE.HDWALLET.INVALID_PHRASE, `invalid phrase, ${error.shortMessage}`));
            }
            else {
                Assert.check(false, MitumError.detail(ECODE.HDWALLET.INVALID_PATH, `invalid path, ${error.shortMessage} with value ${error.value}`));
            }
            throw error;
        }
    }
};

function getRandomN(n, f) {
    Assert.check(Config.KEYS_IN_ACCOUNT.satisfy(n), MitumError.detail(ECODE.INVALID_KEYS, `${n} is out of range`));
    n = Math.floor(n);
    let weight = Math.floor(Config.THRESHOLD.max / n);
    if (Config.THRESHOLD.max % n) {
        weight += 1;
    }
    const ks = [];
    const kps = [];
    for (let i = 0; i < n; i++) {
        kps.push(f());
        ks.push(new PubKey(kps[i].publicKey, weight));
    }
    return {
        keys: new Keys(ks, Config.THRESHOLD.max),
        keypairs: kps,
    };
}
const randomN = (n, option) => {
    return getRandomN(n, () => KeyPair.random(option));
};

class KeyG extends Generator {
    constructor(networkID, api, delegateIP) {
        super(networkID, api, delegateIP);
    }
    fillHDwallet(hdwallet) {
        return {
            privatekey: hdwallet.privatekey,
            publickey: hdwallet.publickey,
            address: this.address(hdwallet.publickey),
            phrase: hdwallet.phrase,
            path: hdwallet.path,
        };
    }
    /**
     * Generate a key pair randomly or from the given string seed. Avoid using seed ​​that are easy to predict.
     * @param {string} [seed] - (Optional) The random string seed for deterministic key generation. If not provided, a random key pair will be generated.
     * @returns An `Account` object with following properties:
     * - `privatekey`: private key,
     * - `publickey`: public key,
     * - `address`: address
     */
    key(seed) {
        if (!seed) {
            const kp = KeyPair.random("mitum");
            return {
                privatekey: kp.privateKey.toString(),
                publickey: kp.publicKey.toString(),
                address: this.address(kp.publicKey),
            };
        }
        const kp = KeyPair.fromSeed(seed, "mitum");
        return {
            privatekey: kp.privateKey.toString(),
            publickey: kp.publicKey.toString(),
            address: this.address(kp.publicKey),
        };
    }
    /**
     * Generate `n` length of array with randomly generated key pairs.
     * @param {number} [n] - The number of accounts to generate.
     * @returns An array of `Account` objects.
     * Properties of `Account`:
     * - `privatekey`: private key,
     * - `publickey`: public key,
     * - `address`: address
     */
    keys(n) {
        return randomN(n, "mitum").keypairs.map(kp => {
            return {
                privatekey: kp.privateKey.toString(),
                publickey: kp.publicKey.toString(),
                address: this.address(kp.publicKey),
            };
        });
    }
    /**
     * Generate a key randomly using the HD wallet method. (BIP-32 standard)
     * @returns An `HDAccount` object with following properties:
     * - `privatekey`: private key,
     * - `publickey`: public key,
     * - `address`: address,
     * - `phrase`: phrases made up of 12 mnemonic words,
     * - `path`: derivation path for HD wallet. Default set to "m/44'/815'/0'/0/0". 815 is a coin type for imFact.
     */
    hdKey() {
        const hdwallet = KeyPair.hdRandom("mitum");
        return this.fillHDwallet(hdwallet);
    }
    /**
     * Generate a key pair from the given private key.
     * @param {string | Key} [key] - The private key.
     * @returns An `Account` object with following properties:
     * - `privatekey`: private key,
     * - `publickey`: public key,
     * - `address`: address
     */
    fromPrivateKey(key) {
        const kp = KeyPair.fromPrivateKey(key);
        return {
            privatekey: kp.privateKey.toString(),
            publickey: kp.publicKey.toString(),
            address: this.address(kp.publicKey),
        };
    }
    /**
     * Generate a key pair from given mnemonic phrase using the HD wallet method.
     * @param {string} [phrase] - The Mnemonic phrase obtained when executed `hdKey()` method.
     * @param {string} [path] - (Optional) The derivation path for HD wallet.
     * @returns An `HDAccount` object with following properties:
     * - `privatekey`: private key,
     * - `publickey`: public key,
     * - `address`: address
     * - `phrase`: phrases made up of 12 mnemonic words,
     * - `path`: derivation path for HD wallet, default set to "m/44'/815'/0'/0/0". 815 is a coin type for imFact.
     */
    fromPhrase(phrase, path) {
        const hdwallet = KeyPair.fromPhrase(phrase, path);
        return this.fillHDwallet(hdwallet);
    }
    /**
     * Generate an address derived the given public key.
     * @param {string | Key} [key] - The public key.
     * @returns The address derived from public key
     */
    address(key) {
        const suffix = key.toString().slice(-3);
        Assert.check(suffix === "fpu", MitumError.detail(ECODE.INVALID_PUBLIC_KEY, "invalid pubkey format"));
        return new Keys([new PubKey(key, 100)], 100).checksum.toString();
    }
    /**
     * Returns a checksummed address for given address string. For invalid address, an error is returned.
     * @param {string} [address] - An address.
     * @returns A checksummed address.
     */
    checksummedAddress(address) {
        try {
            const valid_address = new Address(address);
            return valid_address.toString();
        }
        catch (error) {
            if (error.code === 'EC_INVALID_ADDRESS_CHECKSUM') {
                return '0x' + getChecksum(address.slice(2, 42)) + SUFFIX.ADDRESS.MITUM;
            }
            else {
                throw error;
            }
        }
    }
    /**
     * Generate a multi-signature address from the given keys.
     * @param {keysType} [keys] - An array of object {`key`: publickey, `weight`: weight for the key}
     * @param {string | number | Big} [threshold] - The threshold for the multi-signature.
     * @returns The multi-signature address.
     * @example
     * const pubkey01 = {
     *     key: "02cb1d73c49d638d98092e35603414b575f3f5b5ce01162cdd80ab68ab77e50e14fpu",
     *     weight: 50
     * };
     * const pubkey02 = {
     *     key: "0377241675aabafca6b1a49f3bc08a581beb0daa330a4ac2008464d63ed7635a22fpu",
     *     weight: 50
     * };
     * const mutiSigAddress = mitum.account.addressForMultiSig([pubkey01, pubkey02], 100);
     */
    addressForMultiSig(keys, threshold) {
        return new Keys(keys.map(k => k instanceof PubKey ? k : new PubKey(k.key, k.weight)), threshold).checksum.toString();
    }
}

async function getAccount(api, address, delegateIP) {
    const apiPath = `${api}/account/${Address.from(address).toString()}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getAccountByPublicKey(api, publicKey, delegateIP) {
    const apiPath = `${api}/accounts?publickey=${Key.from(publicKey).toString()}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
var account = {
    getAccount,
    getAccountByPublicKey,
};

async function getBlocks(api, delegateIP, limit, offset, reverse) {
    const apiPath = apiPathWithParams(`${api}/block/manifests`, limit, offset, reverse);
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getBlockByHeight(api, height, delegateIP) {
    const apiPath = `${api}/block/${Big.from(height).toString()}/manifest`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getBlockByHash(api, hash, delegateIP) {
    const apiPath = `${api}/block/${hash}/manifest`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
var block = {
    getBlocks,
    getBlockByHeight,
    getBlockByHash,
};

async function getNode(api, delegateIP) {
    const apiPath = `${api}/`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
var node = {
    getNode,
};

async function getOperations(api, delegateIP, limit, offset, reverse) {
    const apiPath = apiPathWithParamsExt(`${api}/block/operations`, limit, offset, reverse);
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getOperation(api, hash, delegateIP) {
    const apiPath = `${api}/block/operation/${hash}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getMultiOperations(api, hashes, delegateIP) {
    const apiPath = `${api}/block/operations/facts?hashes=${hashes.join(",")}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getBlockOperationsByHeight(api, height, delegateIP, limit, offset, reverse) {
    const apiPath = apiPathWithParams(`${api}/block/${Big.from(height).toString()}/operations`, limit, offset, reverse);
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
// async function getBlockOperationsByHash(api: string | undefined, hash: string, delegateIP: string | undefined) {
//     const apiPath = `${api}/block/${hash}/operations`;
//     return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath))  
// }
async function getAccountOperations(api, address, delegateIP, limit, offset, reverse) {
    const apiPath = apiPathWithParamsExt(`${api}/account/${Address.from(address).toString()}/operations`, limit, offset, reverse);
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function send(api, operation, delegateIP, config) {
    const apiPath = `${api}/builder/send`;
    return !delegateIP
        ? await axios.post(apiPath, JSON.stringify(operation), config)
        : await axios.post(delegateIP.toString(), { ...Object(operation), uri: apiPath }, config);
}
var api$1 = {
    getOperations,
    getOperation,
    getBlockOperationsByHeight,
    getMultiOperations,
    getAccountOperations,
    send
};

async function getCurrencies(api, delegateIP) {
    const apiPath = `${api}/currency`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getCurrency(api, currency, delegateIP) {
    const apiPath = `${api}/currency/${CurrencyID.from(currency).toString()}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
var currency$1 = {
    getCurrencies,
    getCurrency,
};

const url$8 = (api, contract) => `${api}/nft/${Address.from(contract).toString()}`;
async function getNFT(api, contract, nftIdx, delegateIP) {
    const apiPath = `${url$8(api, contract)}/nftidx/${nftIdx}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getNFTs(api, contract, delegateIP, factHash, limit, offset, reverse) {
    const apiPath = apiPathWithHashParams(`${url$8(api, contract)}/nfts`, factHash, limit, offset, reverse);
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getNFTCount(api, contract, delegateIP) {
    const apiPath = `${url$8(api, contract)}/totalsupply`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getModel$7(api, contract, delegateIP) {
    const apiPath = `${url$8(api, contract)}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getAccountOperators(api, contract, account, delegateIP) {
    const apiPath = `${url$8(api, contract)}/account/${Address.from(account).toString()}/allapproved`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
var nft = {
    getNFT,
    getNFTs,
    getNFTCount,
    getModel: getModel$7,
    getAccountOperators,
};

const url$7 = (api, contract) => `${api}/did/${Address.from(contract).toString()}`;
async function getModel$6(api, contract, delegateIP) {
    const apiPath = `${url$7(api, contract)}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getCredential(api, contract, templateID, credentialID, delegateIP) {
    const apiPath = `${url$7(api, contract)}/template/${templateID}/credential/${credentialID}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getTemplate(api, contract, templateID, delegateIP) {
    const apiPath = `${url$7(api, contract)}/template/${templateID}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getCredentials(api, contract, templateID, delegateIP) {
    const apiPath = `${url$7(api, contract)}/template/${templateID}/credentials`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getCredentialByHolder(api, contract, holder, delegateIP) {
    const apiPath = `${url$7(api, contract)}/holder/${Address.from(holder).toString()}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
var credential = {
    getModel: getModel$6,
    getCredential,
    getTemplate,
    getCredentials,
    getCredentialByHolder,
};

const url$6 = (api, contract) => `${api}/dao/${Address.from(contract).toString()}`;
async function getModel$5(api, contract, delegateIP) {
    const apiPath = `${url$6(api, contract)}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getProposal(api, contract, proposalID, delegateIP) {
    const apiPath = `${url$6(api, contract)}/proposal/${proposalID}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getApproved(api, contract, proposalID, registrant, delegateIP) {
    const apiPath = `${url$6(api, contract)}/proposal/${proposalID}/registrant/${Address.from(registrant).toString()}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getVoters(api, contract, proposalID, delegateIP) {
    const apiPath = `${url$6(api, contract)}/proposal/${proposalID}/voter`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getVotingStatus(api, contract, proposalID, delegateIP) {
    const apiPath = `${url$6(api, contract)}/proposal/${proposalID}/votingpower`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
var dao = {
    getModel: getModel$5,
    getProposal,
    getApproved,
    getVoters,
    getVotingStatus,
};

var kyc = {};

const url$5 = (api, contract) => `${api}/sto/${Address.from(contract).toString()}`;
async function getService(api, contract, delegateIP) {
    const apiPath = `${url$5(api, contract)}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getPartitions(api, contract, holder, delegateIP) {
    const apiPath = `${url$5(api, contract)}/holder/${Address.from(holder).toString()}/partitions`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getBalanceByHolder(api, contract, holder, partition, delegateIP) {
    const apiPath = `${url$5(api, contract)}/holder/${Address.from(holder).toString()}/partition/${partition}/balance`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getOperatorsByHolder(api, contract, holder, partition, delegateIP) {
    const apiPath = `${url$5(api, contract)}/holder/${Address.from(holder).toString()}/partition/${partition}/operators`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getPartitionBalance(api, contract, partition, delegateIP) {
    const apiPath = `${url$5(api, contract)}/p
    artition/${partition}/balance`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getAuthorized(api, contract, operator, delegateIP) {
    const apiPath = `${url$5(api, contract)}/operator/${Address.from(operator).toString()}/holders`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
var sto = {
    getService,
    getPartitions,
    getBalanceByHolder,
    getOperatorsByHolder,
    getPartitionBalance,
    getAuthorized,
};

const url$4 = (api, contract) => `${api}/timestamp/${Address.from(contract).toString()}`;
async function getModel$4(api, contract, delegateIP) {
    const apiPath = `${url$4(api, contract)}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getTimeStamp(api, contract, projectID, timestampIdx, delegateIP) {
    const apiPath = `${url$4(api, contract)}/project/${projectID}/idx/${Big.from(timestampIdx).toString()}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
var timestamp = {
    getModel: getModel$4,
    getTimeStamp,
};

const url$3 = (api, contract) => `${api}/token/${Address.from(contract).toString()}`;
async function getModel$3(api, contract, delegateIP) {
    const apiPath = `${url$3(api, contract)}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getTokenBalance(api, contract, account, delegateIP) {
    const apiPath = `${url$3(api, contract)}/account/${Address.from(account).toString()}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
var token = {
    getModel: getModel$3,
    getTokenBalance,
};

const url$2 = (api, contract) => `${api}/point/${Address.from(contract).toString()}`;
async function getModel$2(api, contract, delegateIP) {
    const apiPath = `${url$2(api, contract)}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getPointBalance(api, contract, account, delegateIP) {
    const apiPath = `${url$2(api, contract)}/account/${Address.from(account).toString()}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
var point = {
    getModel: getModel$2,
    getPointBalance,
};

const url$1 = (api, contract) => `${api}/storage/${Address.from(contract).toString()}`;
async function getModel$1(api, contract, delegateIP) {
    const apiPath = `${url$1(api, contract)}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getData(api, contract, dataKey, delegateIP) {
    const apiPath = `${url$1(api, contract)}/datakey/${dataKey}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getDataHistory(api, contract, dataKey, delegateIP, limit, offset, reverse) {
    const apiPath = apiPathWithParams(`${url$1(api, contract)}/datakey/${dataKey}/history`, limit, offset, reverse);
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getDataCount(api, contract, delegateIP, deleted) {
    const apiPath = `${url$1(api, contract)}/datacount?deleted=${deleted ? 1 : 0}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
var storage = {
    getModel: getModel$1,
    getData,
    getDataHistory,
    getDataCount
};

const url = (api, contract) => `${api}/payment/${Address.from(contract).toString()}`;
async function getModel(api, contract, delegateIP) {
    const apiPath = `${url(api, contract)}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
async function getAccountInfo(api, contract, address, delegateIP) {
    const apiPath = `${url(api, contract)}/account/${Address.from(address).toString()}`;
    return !delegateIP ? await axios.get(apiPath) : await axios.get(delegateUri(delegateIP) + encodeURIComponent(apiPath));
}
var payment = {
    getAccountInfo,
    getModel,
};

var models = {
    currency: currency$1,
    contract: {
        nft,
        credential,
        dao,
        kyc,
        sto,
        timestamp,
        token,
        point,
        storage,
        payment
    },
};

const currency = models.currency;
const contractApi = models.contract;
var api = {
    account,
    block,
    node,
    operation: api$1,
    currency,
    contractApi,
};
async function getAPIData(f, _links) {
    try {
        const res = await f();
        const parsedResponse = {
            status: res.status,
            method: res.config.method,
            url: res.config.url,
            request_body: res.config.data,
            data: _links ? { _embedded: res.data._embedded, _links: res.data._links } : res.data._embedded,
        };
        return parsedResponse;
    }
    catch (error) {
        if (error.response) {
            const { response } = error;
            const parsedError = {
                status: response.status,
                method: response.config.method,
                url: response.config.url,
                error_code: response.config.method === 'get' ? '' : response.data ? assignCodeFromErrorMessage(response.data) : '',
                request_body: response.config.data,
                error_message: response.data,
            };
            return parsedError;
        }
        else if (error.code) {
            const parsedError = {
                status: 500,
                method: error.config.method,
                url: error.config.url,
                error_code: "",
                request_body: error.config.data,
                error_message: error.code,
            };
            return parsedError;
        }
        else {
            throw MitumError.detail(ECODE.UNKNOWN, `Unknown error orccur!\n${error}`);
        }
    }
}

class Node extends Generator {
    constructor(api, delegateIP) {
        super("", api, delegateIP);
    }
    /**
     * Get information about the nodes in the network.
     * @async
     * @returns The `data` of `SuccessResponse` represents an array of information of nodes:
     * - `network_id`: The ID of the network to which the node belongs.
     * - `last_manifest`: Information about the most recently created block.
     * - `network_policy`: Policy information of the network.
     * - `local`: Information about the local node.
     * - `consensus`: Status of consensus on the node.
     * - `_hint`: Indicates that the data represents node information.
     */
    async getNodeInfo() {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        return await getAPIData(() => node.getNode(this.api, this.delegateIP));
    }
}
class Block extends Generator {
    constructor(api, delegateIP) {
        super("", api, delegateIP);
    }
    /**
     * Get the account information for the given public key.
     * @async
     * @param {number} [limit] - (Optional) The maximum number of items to retrieve.
     * @param {number} [offset] - (Optional) The number of items skip before starting to return data.
     * @param {boolean} [reverse] - (Optional) Whether to return the items in reverse newest order.
     * @returns The `data` of `SuccessResponse` is a array with block manifest info object:
     * - `_hint`: Indicates mitum engine version,
     * - `_embedded`:
     * - - `Manifest`: manifest info includes `proposed_at`, `states_tree`, `hash`, `previous`, `proposal`, `operations_tree`, `suffrage`, `_hint`, `height`. </div/>
     * - - `operations`: number of operations included in the block,
     * - - `confirmed_at`: timestamp,
     * - - `proposer`: node name of proposer,
     * - - `round`: number of round to manifest,
     * - `_links`: links to get additional information
     */
    async getAllBlocks(limit, offset, reverse) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        return await getAPIData(() => block.getBlocks(this.api, this.delegateIP, limit, offset, reverse));
    }
    /**
     * Get information of a block by hash.
     * @async
     * @param {string} [hash] - The hash value of the block to retrieve.
     * @returns The `data` of `SuccessResponse` represents a block manifest:
     * - `Manifest`:
     * - - `proposed_at`: Timestamp when the block was proposed,
     * - - `states_tree`: Hash for state tree,
     * - - `hash`: Hash for the block,
     * - - `previous`: Hash for the previous block,
     * - - `proposal`: Hash for the proposal,
     * - - `operations_tree`: Hash for the operation tree,
     * - - `suffrage`: Hash for the suffrage,
     * - - `_hint`: Hint for the manifest,
     * - - `height`: Block height
     * - `operations`: The number of operations included in the block,
     * - `confirmed_at`: Timestamp when the block was confirmed,
     * - `proposer`: The node name of proposer,
     * - `round`: The number of round to manifest
     */
    async getBlockByHash(hash) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        return await getAPIData(() => block.getBlockByHash(this.api, hash, this.delegateIP));
    }
    /**
     * Get information of a block by height.
     * @async
     * @param {number | string} [height] - The height of the block to retrieve.
     * @returns The `data` of `SuccessResponse` represents a block manifest:
     * - `Manifest`:
     * - - `proposed_at`: Timestamp when the block was proposed,
     * - - `states_tree`: Hash for state tree,
     * - - `hash`: Hash for the block,
     * - - `previous`: Hash for the previous block,
     * - - `proposal`: Hash for the proposal,
     * - - `operations_tree`: Hash for the operation tree,
     * - - `suffrage`: Hash for the suffrage,
     * - - `_hint`: Hint for the manifest,
     * - - `height`: Block height
     * - `operations`: The number of operations included in the block,
     * - `confirmed_at`: Timestamp when the block was confirmed,
     * - `proposer`: The node name of proposer,
     * - `round`: The number of round to manifest
     */
    async getBlockByHeight(height) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        return await getAPIData(() => block.getBlockByHeight(this.api, height, this.delegateIP));
    }
    // async getOperationsByHash(hash: string) {
    //     Assert.check(
    //         this.api !== undefined || this.api !== null,
    //         MitumError.detail(ECODE.NO_API, "no api"),
    //     )
    //     return await getAPIData(() => operation.getBlockOperationsByHash(this.api, hash, this.delegateIP))
    // }
    /**
     * Get all operations contained in a block of given height.
     * @async
     * @param {number | string} [height] - The height of the block to retrieve operations from.
     * @param {number} [limit] - (Optional) The maximum number of items to retrieve.
     * @param {number} [offset] - (Optional) The number of items skip before starting to return data.
     * @param {boolean} [reverse] - (Optional) Whether to return the items in reverse newest order.
     * @returns The `data` of `SuccessResponse` represents an array of all operations in the block:
     * - `_hint`: Indicates mitum engine version,
     * - `_embedded`:
     * - - `_hint`: Hint for the operation,
     * - - `hash`: Hash for the fact,
     * - - `operation`: Information of the operation includes `hash`, `fact`, `signs`, `_hint`,
     * - - `height`: Block height containing the operation,
     * - - `confirmed_at`: Timestamp when the block was confirmed,
     * - - `reason`: Reason for operation failure,
     * - - `in_state`: Boolean indicating whether the operation was successful or not,
     * - - `index`: Index of the operation in the block
     * - `_links`: Links to get additional information
     */
    async getOperationsByHeight(height, limit, offset, reverse) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        return await getAPIData(() => api$1.getBlockOperationsByHeight(this.api, height, this.delegateIP, limit, offset, reverse));
    }
}

class Utils {
    constructor(decimal = 9) {
        this.decimal = decimal;
    }
    /**
     * Sets the decimal value used for unit conversions.
     * @param {number} decimal - The decimal places to be used, input integer must equal or greater than 0.
     */
    setDecimal(decimal) {
        Assert.check(Number.isInteger(decimal) && decimal >= 0, MitumError.detail(ECODE.INVALID_DECIMAL, "Invalid decimal number"));
        this.decimal = decimal;
    }
    /**
     * Validates if a string can be converted to a BigInt.
     * @param {string} value - The value to be validated.
     * @returns {boolean} - True if valid, false otherwise.
     */
    isValidBigIntString(value) {
        try {
            BigInt(value);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Validates if a string is a valid decimal number.
     * @param {string} value - The value to be validated.
     * @returns {boolean} - True if valid, false otherwise.
     */
    isValidDecimalString(value) {
        const decimalPattern = /^-?\d+(\.\d+)?$/;
        return decimalPattern.test(value);
    }
    /**
     * Converts integer string *value* into a "decimal string", assuming decimal places.
     * The `decimal` number can be set with `setDecimal()` and the default value is 9.
     * @param {string} value - Integer in string type.
     * @returns {string} - Value expressed in minimum units.
     * @example
     * // Example: Convert PAGE to FACT (decimal: 9)
     * const value = "20000000000"; //PAGE
     * const result = mitum.utils.formatUnits(value);
     * console.log(`PAGE to FACT: ${result}`); // "20.0"
     */
    formatUnits(value) {
        Assert.check(this.isValidBigIntString(value), MitumError.detail(ECODE.INVALID_BIG_INTEGER, "Invalid BigNumberish string: Cannot convert to a BigInt"));
        const bigIntVal = BigInt(value);
        const factor = BigInt(10 ** this.decimal);
        const integerPart = bigIntVal / factor;
        const integerString = integerPart === 0n && bigIntVal < 0n ? `-${integerPart.toString()}` : integerPart.toString();
        const fractionalPart = bigIntVal % factor < 0n ? -bigIntVal % factor : bigIntVal % factor;
        const fractionalString = fractionalPart.toString().padStart(this.decimal, '0');
        if (fractionalString === undefined || /^0*$/.test(fractionalString)) {
            return `${integerString}.0`;
        }
        else {
            return `${integerString}.${fractionalString.replace(/0+$/, '')}`;
        }
    }
    /**
     * Converts the "decimal string" *value* to a integer string, assuming decimal places.
     * The `decimal` number can be set with `setDecimal()` and the default value is 9.
     * @param {string} value - Decimal number in string type.
     * @returns {string} - Value expressed in basis units.
     * @example
     * // Example: Convert FACT to PAGE (decimal: 9)
     * const value = "12.12345"; //FACT
     * const result = mitum.utils.parseUnits(value);
     * console.log(`FACT to PAGE: ${result}`); // "12123450000"
     */
    parseUnits(value) {
        Assert.check(this.isValidDecimalString(value), MitumError.detail(ECODE.INVALID_FLOAT, "Invalid decimal string"));
        if (Number(value) === 0) {
            return "0";
        }
        let [integerPart, fractionalPart = ''] = value.split('.');
        fractionalPart = Number(fractionalPart) === 0 ? '' : fractionalPart;
        integerPart = Number(integerPart) === 0 ? '' : integerPart;
        Assert.check(fractionalPart.length <= this.decimal, MitumError.detail(ECODE.INVALID_FLOAT, "Fractional part exceeds the decimal limit"));
        const paddedFractional = fractionalPart.padEnd(this.decimal, '0');
        return integerPart + paddedFractional;
    }
}

class CurrencyItem extends Item {
    constructor(hint, amounts) {
        super(hint);
        Assert.check(Config.AMOUNTS_IN_ITEM.satisfy(amounts.length), MitumError.detail(ECODE.INVALID_AMOUNTS, "amounts length out of range"));
        Assert.check(new Set(amounts.map(am => am.currency.toString())).size === amounts.length, MitumError.detail(ECODE.INVALID_AMOUNTS, "duplicate amounts found in amounts"));
        this.amounts = amounts;
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            amounts: this.amounts.sort(SortFunc).map(am => am.toHintedObject()),
        };
    }
}

class CreateAccountItem extends CurrencyItem {
    constructor(keys, amounts) {
        super(HINT.CURRENCY.CREATE_ACCOUNT.ITEM, amounts);
        this.keys = keys;
    }
    toBuffer() {
        return Buffer.concat([
            this.keys.toBuffer(),
            Buffer.concat(this.amounts.sort(SortFunc).map(am => am.toBuffer())),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            keys: this.keys.toHintedObject(),
        };
    }
    toString() {
        return base58.encode(this.keys.toBuffer());
    }
}
class CreateAccountFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.CURRENCY.CREATE_ACCOUNT.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate key hash found in items"));
    }
    get operationHint() {
        return HINT.CURRENCY.CREATE_ACCOUNT.OPERATION;
    }
}

class UpdateKeyFact extends Fact {
    constructor(token, sender, keys, currency) {
        super(HINT.CURRENCY.UPDATE_KEY.FACT, token);
        this.sender = Address.from(sender);
        this.keys = keys;
        this.currency = CurrencyID.from(currency);
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.sender.toBuffer(),
            this.keys.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            sender: this.sender.toString(),
            keys: this.keys.toHintedObject(),
            currency: this.currency.toString(),
        };
    }
    get operationHint() {
        return HINT.CURRENCY.UPDATE_KEY.OPERATION;
    }
}

let TransferItem$1 = class TransferItem extends CurrencyItem {
    constructor(receiver, amounts) {
        super(HINT.CURRENCY.TRANSFER.ITEM, amounts);
        if (typeof receiver === "string") {
            if (receiver.endsWith(SUFFIX.ADDRESS.ZERO)) {
                this.receiver = new ZeroAddress(receiver);
            }
            else {
                this.receiver = new Address(receiver);
            }
        }
        else {
            this.receiver = receiver;
        }
        if (this.receiver.type === "zero") {
            for (const am of amounts) {
                Assert.check(am.currency.equal(this.receiver.currency), MitumError.detail(ECODE.INVALID_AMOUNT, "invalid amount currency for given zero address"));
            }
        }
    }
    toBuffer() {
        return Buffer.concat([
            this.receiver.toBuffer(),
            Buffer.concat(this.amounts.sort(SortFunc).map(am => am.toBuffer())),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            receiver: this.receiver.toString(),
        };
    }
    toString() {
        return this.receiver.toString();
    }
};
let TransferFact$4 = class TransferFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.CURRENCY.TRANSFER.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate receiver found in items"));
        this.items.forEach(it => Assert.check(this.sender.toString() != it.receiver.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with receiver address")));
    }
    get operationHint() {
        return HINT.CURRENCY.TRANSFER.OPERATION;
    }
};

class CreateContractAccountItem extends CurrencyItem {
    constructor(keys, amounts) {
        super(HINT.CURRENCY.CREATE_CONTRACT_ACCOUNT.ITEM, amounts);
        this.keys = keys;
    }
    toBuffer() {
        return Buffer.concat([
            this.keys.toBuffer(),
            Buffer.concat(this.amounts.sort(SortFunc).map(am => am.toBuffer())),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            keys: this.keys.toHintedObject(),
        };
    }
    toString() {
        return base58.encode(this.keys.toBuffer());
    }
}
class CreateContractAccountFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.CURRENCY.CREATE_CONTRACT_ACCOUNT.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate key hash found in items"));
    }
    get operationHint() {
        return HINT.CURRENCY.CREATE_CONTRACT_ACCOUNT.OPERATION;
    }
}

class WithdrawItem extends CurrencyItem {
    constructor(target, amounts) {
        super(HINT.CURRENCY.WITHDRAW.ITEM, amounts);
        this.target = typeof target === "string" ? new Address(target) : target;
    }
    toBuffer() {
        return Buffer.concat([
            this.target.toBuffer(),
            Buffer.concat(this.amounts.sort(SortFunc).map(am => am.toBuffer())),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            target: this.target.toString(),
        };
    }
    toString() {
        return this.target.toString();
    }
}
let WithdrawFact$1 = class WithdrawFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.CURRENCY.WITHDRAW.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate target found in items"));
        this.items.forEach(it => Assert.check(this.sender.toString() != it.target.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with target address")));
    }
    get operationHint() {
        return HINT.CURRENCY.WITHDRAW.OPERATION;
    }
};

class UpdateHandlerFact extends Fact {
    constructor(token, sender, contract, currency, handlers) {
        super(HINT.CURRENCY.UPDATE_HANDLER.FACT, token);
        this.sender = Address.from(sender);
        this.contract = Address.from(contract);
        this.currency = CurrencyID.from(currency);
        this.handlers = handlers.map(a => Address.from(a));
        this._hash = this.hashing();
        ArrayAssert.check(handlers, "handlers")
            .rangeLength(Config.CONTRACT_HANDLERS)
            .noDuplicates();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.sender.toBuffer(),
            this.contract.toBuffer(),
            this.currency.toBuffer(),
            Buffer.concat(this.handlers.sort(SortFunc).map(a => a.toBuffer())),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            sender: this.sender.toString(),
            contract: this.contract.toString(),
            currency: this.currency.toString(),
            handlers: this.handlers.sort(SortFunc).map((w) => w.toString()),
        };
    }
    get operationHint() {
        return HINT.CURRENCY.UPDATE_HANDLER.OPERATION;
    }
}

class RegisterCurrencyFact extends NodeFact {
    constructor(token, design) {
        super(HINT.CURRENCY.REGISTER_CURRENCY.FACT, token);
        this.design = design;
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            this.token.toBuffer(),
            this.design.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            currency: this.design.toHintedObject(),
        };
    }
    get operationHint() {
        return HINT.CURRENCY.REGISTER_CURRENCY.OPERATION;
    }
}

class UpdateCurrencyFact extends NodeFact {
    constructor(token, currency, policy) {
        super(HINT.CURRENCY.UPDATE_CURRENCY.FACT, token);
        this.currency = CurrencyID.from(currency);
        this.policy = policy;
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.currency.toBuffer(),
            this.policy.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            currency: this.currency.toString(),
            policy: this.policy.toHintedObject(),
        };
    }
    get operationHint() {
        return HINT.CURRENCY.UPDATE_CURRENCY.OPERATION;
    }
}

let MintItem$1 = class MintItem extends Item {
    constructor(receiver, amount) {
        super(HINT.CURRENCY.MINT.ITEM);
        this.amount = amount;
        this.receiver = Address.from(receiver);
    }
    toBuffer() {
        return Buffer.concat([
            this.receiver.toBuffer(),
            this.amount.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            receiver: this.receiver.toString(),
            amount: this.amount.toHintedObject(),
        };
    }
    toString() {
        return `${this.receiver.toString()}-${this.amount.currency.toString()}`;
    }
};
let MintFact$3 = class MintFact extends NodeFact {
    constructor(token, items) {
        super(HINT.CURRENCY.MINT.FACT, token);
        Assert.check(Config.ITEMS_IN_FACT.satisfy(items.length), MitumError.detail(ECODE.INVALID_ITEMS, "items length out of range"));
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate receiver-currency found in items"));
        this.items = items;
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            Buffer.concat(this.items.sort(SortFunc).map(it => it.toBuffer())),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            items: this.items.sort(SortFunc).map(it => it.toHintedObject()),
        };
    }
    get operationHint() {
        return HINT.CURRENCY.MINT.OPERATION;
    }
};

class CurrencyDesign {
    constructor(initialSupply, currencyID, genesisAccount, decimal, policy) {
        this.initialSupply = Big.from(initialSupply);
        this.currencyID = CurrencyID.from(currencyID);
        this.genesisAccount = Address.from(genesisAccount);
        this.policy = policy;
        this.totalSupply = Big.from(initialSupply);
        this.decimal = Big.from(decimal);
    }
    toBuffer() {
        return Buffer.concat([
            this.initialSupply.toBuffer(),
            this.currencyID.toBuffer(),
            this.decimal.toBuffer(),
            this.genesisAccount.toBuffer(),
            this.policy.toBuffer(),
            this.totalSupply.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            _hint: CurrencyDesign.hint.toString(),
            currency_id: this.currencyID.toString(),
            decimal: this.decimal.toString(),
            genesis_account: this.genesisAccount.toString(),
            initial_supply: this.initialSupply.toString(),
            policy: this.policy.toHintedObject(),
            total_supply: this.totalSupply.toString(),
        };
    }
}
CurrencyDesign.hint = new Hint(HINT.CURRENCY.DESIGN);
class CurrencyPolicy {
    constructor(newAccountMinBalance, feeer) {
        this.newAccountMinBalance = Big.from(newAccountMinBalance);
        this.feeer = feeer;
    }
    toBuffer() {
        return Buffer.concat([
            this.newAccountMinBalance.toBuffer(),
            this.feeer.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            _hint: CurrencyPolicy.hint.toString(),
            feeer: this.feeer.toHintedObject(),
            min_balance: this.newAccountMinBalance.toString(),
        };
    }
}
CurrencyPolicy.hint = new Hint(HINT.CURRENCY.POLICY);
class Feeer {
    constructor(hint, exchangeMinAmount) {
        this.hint = new Hint(hint);
        if (exchangeMinAmount) {
            this.exchangeMinAmount = exchangeMinAmount instanceof Big ? exchangeMinAmount : new Big(exchangeMinAmount);
        }
    }
    toHintedObject() {
        return {
            _hint: this.hint.toString()
        };
    }
}
class NilFeeer extends Feeer {
    constructor() {
        super(HINT.CURRENCY.FEEER.NIL);
    }
    toBuffer() {
        return Buffer.from([]);
    }
}
class FixedFeeer extends Feeer {
    constructor(receiver, amount) {
        super(HINT.CURRENCY.FEEER.FIXED);
        this.receiver = Address.from(receiver);
        this.amount = Big.from(amount);
    }
    toBuffer() {
        return Buffer.concat([
            this.receiver.toBuffer(),
            this.amount.toBuffer(),
            this.exchangeMinAmount ? this.exchangeMinAmount.toBuffer() : Buffer.from([])
        ]);
    }
    toHintedObject() {
        const feeer = {
            ...super.toHintedObject(),
            amount: this.amount.toString(),
            receiver: this.receiver.toString(),
        };
        if (this.exchangeMinAmount) {
            return {
                ...feeer,
                exchange_min_amount: this.exchangeMinAmount.toString()
            };
        }
        return feeer;
    }
}
class RatioFeeer extends Feeer {
    constructor(receiver, ratio, min, max) {
        super(HINT.CURRENCY.FEEER.RATIO);
        this.receiver = Address.from(receiver);
        this.ratio = new Float(ratio);
        this.min = min instanceof Big ? min : new Big(min);
        this.max = max instanceof Big ? max : new Big(max);
    }
    toBuffer() {
        return Buffer.concat([
            this.receiver.toBuffer(),
            this.ratio.toBuffer(),
            this.min.toBuffer(),
            this.max.toBuffer(),
            this.exchangeMinAmount ? this.exchangeMinAmount.toBuffer() : Buffer.from([])
        ]);
    }
    toHintedObject() {
        const feeer = {
            ...super.toHintedObject(),
            receiver: this.receiver.toString(),
            ratio: this.ratio.n,
            min: this.min.toString(),
            max: this.max.toString(),
        };
        if (this.exchangeMinAmount) {
            return {
                ...feeer,
                exchange_min_amount: this.exchangeMinAmount.toString(),
            };
        }
        return feeer;
    }
}

class Currency extends Generator {
    constructor(networkID, api, delegateIP) {
        super(networkID, api, delegateIP);
    }
    /**
     * Generate a `register-currency` operation for registering a new currency.
     * **Signature of nodes** is required, not a general account signature.
     * @param {string | Address} [genesisAddress] - genesis account's address.
     * @param {string | number | Big} [initialSupply] - initial supply amount.
     * @param {string | CurrencyID} [currencyID] - currency ID to resgister.
     * @param {string | number | Big} [decimal] - decimal number for the currency.
     * @param {currencyPolicyData} [data] - The currency policy data.
     * @returns `register-currency` operation.
     */
    registerCurrency(genesisAddress, initialSupply, currencyID, decimal, data) {
        Address.from(genesisAddress);
        const keysToCheck = ['minBalance', 'feeType', 'feeReceiver'];
        keysToCheck.forEach((key) => {
            Assert.check(data[key] !== undefined, MitumError.detail(ECODE.INVALID_DATA_STRUCTURE, `${key} is undefined, check the currencyPolicyData structure`));
        });
        const design = new CurrencyDesign(initialSupply, currencyID, genesisAddress, decimal, this.buildPolicy(data.feeType, data.minBalance, data.feeReceiver, data.fee, data.ratio, data.minFee, data.maxFee));
        return new Operation$1(this.networkID, new RegisterCurrencyFact(TimeStamp$1.new().UTC(), design));
    }
    /**
     * Generate an `update-currency` operation for updating an existing Mitum currency.
     * **Signature of nodes** is required, not a general account signature.
     * @param {string | CurrencyID} [currency] - The currency ID to want to updated.
     * @param {currencyPolicyData} [data] - The currency policy data.
     * @returns `update-currency` operation.
     */
    updateCurrency(currency, data) {
        const keysToCheck = ['minBalance', 'feeType', 'feeReceiver'];
        keysToCheck.forEach((key) => {
            Assert.check(data[key] !== undefined, MitumError.detail(ECODE.INVALID_DATA_STRUCTURE, `${key} is undefined, check the currencyPolicyData structure`));
        });
        return new Operation$1(this.networkID, new UpdateCurrencyFact(TimeStamp$1.new().UTC(), currency, this.buildPolicy(data.feeType, data.minBalance, data.feeReceiver, data.fee, data.ratio, data.minFee, data.maxFee)));
    }
    buildPolicy(feeType, minBalance, receiver, fee, ratio, min, max) {
        Address.from(receiver);
        switch (feeType) {
            case "nil":
                return new CurrencyPolicy(minBalance, new NilFeeer());
            case "fixed":
                Assert.check(fee !== undefined, MitumError.detail(ECODE.CURRENCY.INVALID_CURRENCY_FEEER, "no fee"));
                return new CurrencyPolicy(minBalance, new FixedFeeer(receiver, fee));
            case "ratio":
                Assert.check(ratio !== undefined, MitumError.detail(ECODE.CURRENCY.INVALID_CURRENCY_FEEER, "no ratio"));
                Assert.check(min !== undefined, MitumError.detail(ECODE.CURRENCY.INVALID_CURRENCY_FEEER, "no min fee"));
                Assert.check(max !== undefined, MitumError.detail(ECODE.CURRENCY.INVALID_CURRENCY_FEEER, "no max fee"));
                return new CurrencyPolicy(minBalance, new RatioFeeer(receiver, ratio, min, max));
            default:
                throw MitumError.detail(ECODE.CURRENCY.INVALID_CURRENCY_FEEER, "invalid fee type");
        }
    }
    /**
     * Generate a `transfer` operation for transferring currency between accounts.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | number | Big} [amount] - The amount to transfer.
     * @returns `transfer` operation.
     */
    transfer(sender, receiver, currency, amount) {
        return new Operation$1(this.networkID, new TransferFact$4(TimeStamp$1.new().UTC(), sender, [
            new TransferItem$1(receiver, [new Amount(currency, amount)])
        ]));
    }
    /**
     * Generate a `transfer` operation for transferring currency to multiple accounts at once.
     * The length of receivers and amounts must be the same.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string[] | Address[]} [receivers] - An array of addresses of receivers.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string[] | number[] | Big[]} [amounts] - An array of amounts to transfer.
     * @returns `transfer` operation.
     */
    batchTransfer(sender, receivers, currency, amounts) {
        ArrayAssert.check(receivers, "receivers").rangeLength(Config.ITEMS_IN_FACT).noDuplicates().sameLength(amounts, "amounts");
        return new Operation$1(this.networkID, new TransferFact$4(TimeStamp$1.new().UTC(), sender, receivers.map((receiver, idx) => new TransferItem$1(receiver, [new Amount(currency, amounts[idx])]))));
    }
    /**
     * Generate a `withdraw`operation for withdrawing currency from an contract account.
     * Only the owner account of the contract can execute the operation.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [target] - The target contract account's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | number | Big} [amount] - The withdrawal amount.
     * @returns `withdraw`operation
     */
    withdraw(sender, target, currency, amount) {
        return new Operation$1(this.networkID, new WithdrawFact$1(TimeStamp$1.new().UTC(), sender, [
            new WithdrawItem(target, [new Amount(currency, amount)])
        ]));
    }
    /**
     * Generate a `withdraw` operation with multiple items for withdrawing currency from multiple contract accounts.
     * Only the owner account of the contract can execute the operation.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string[] | Address[]} [targets] - The array of target contract account's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | number | Big} [amounts] - The array of withdrawal amount.
     * @returns `withdraw`operation
     */
    multiWithdraw(sender, targets, currency, amounts) {
        ArrayAssert.check(targets, "targets").rangeLength(Config.ITEMS_IN_FACT).sameLength(amounts, "amounts");
        const items = targets.map((el, idx) => { return new WithdrawItem(el, [new Amount(currency, amounts[idx])]); });
        return new Operation$1(this.networkID, new WithdrawFact$1(TimeStamp$1.new().UTC(), sender, items));
    }
    /**
     * Generate a `mint` operation for minting currency and allocating it to a receiver.
     * **Signature of nodes** is required, not a general account signature.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {number} [amount] - The amount to mint.
     * @returns `mint` operation.
     */
    mint(receiver, currency, amount) {
        return new Operation$1(this.networkID, new MintFact$3(TimeStamp$1.new().UTC(), [
            new MintItem$1(receiver, new Amount(currency, amount))
        ]));
    }
    /**
     * Get a list of all currency in the blockchain network.
     * @async
     * @returns `data` of `SuccessResponse` is a array with currency id.
     */
    async getAllCurrencies() {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        const response = await getAPIData(() => api.currency.getCurrencies(this.api, this.delegateIP), true);
        if (isSuccessResponse(response) && response.data) {
            response.data = response.data._links ?
                Object.keys(response.data._links)
                    .filter(c => !(c === "self" || c === "currency:{currencyid}"))
                    .map(c => c)
                : null;
        }
        return response;
    }
    /**
     * Get currency information abount given currency ID.
     * @async
     * @param {string | CurrencyID} [currencyID] - The currency ID.
     * @returns `data` of `SuccessResponse` is currency information:
     * - `_hint`: Hint for currency design
     * - `initial_supply`: [Amount]
     * - `genesis_account`: Initial account for the currency.
     * - `policy`: Currency policy information including `min_balance`, `feeer`
     * - `total_supply`: Total supply amount of the currency.
     */
    async getCurrency(currencyID) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        return await getAPIData(() => api.currency.getCurrency(this.api, currencyID, this.delegateIP));
    }
}
class Account extends KeyG {
    constructor(networkID, api, delegateIP) {
        super(networkID, api, delegateIP);
    }
    /**
     * Generate a key pair and the corresponding `transfer` operation to create a single-sig account. Avoid using seed ​​that are easy to predict.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | number | Big} [amount] - The initial amount. (to be paid by the sender)
     * @param {string} [seed] - (Optional) The seed for deterministic key generation. If not provided, a random key pair will be generated.
     * @param {string | number | Big} [weight] - (Optional) The weight for the public key. If not provided, the default value is 100.
     * @returns An object containing the wallet(key pair) and the `transfer` operation.
     */
    createWallet(sender, currency, amount, seed, weight) {
        const kp = seed ? KeyPair.fromSeed(seed, "mitum") : KeyPair.random("mitum");
        const ks = new Keys([new PubKey(kp.publicKey, weight ?? 100)], weight ?? 100);
        return {
            wallet: {
                privatekey: kp.privateKey.toString(),
                publickey: kp.publicKey.toString(),
                address: ks.checksum.toString()
            },
            operation: new Operation$1(this.networkID, new TransferFact$4(TimeStamp$1.new().UTC(), sender, [
                new TransferItem$1(ks.checksum, [new Amount(currency, amount)])
            ])),
        };
    }
    /**
     * Generate `n` number of key pairs and the corresponding `transfer` operation to create single-sig accounts.
     * @param {string | Address} [sender] - The sender's address.
     * @param {number} [n] - The number of account to create.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | number | Big} [amount] - The initial amount. (to be paid by the sender)
     * @returns An object containing the wallet (key pairs) and the `transfer` operation.
     */
    createBatchWallet(sender, n, currency, amount) {
        const keyArray = this.keys(n);
        const items = keyArray.map((ks) => new TransferItem$1(ks.address, [new Amount(currency, amount)]));
        return {
            wallet: keyArray,
            operation: new Operation$1(this.networkID, new TransferFact$4(TimeStamp$1.new().UTC(), sender, items)),
        };
    }
    /**
     * Generate a `transfer` operation for the given public key.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Key | PubKey} [key] - The public key or key object.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | number | Big} [amount] - The initial amount. (to be paid by the sender)
     * @returns `transfer` operation.
     */
    createAccount(sender, key, currency, amount) {
        const ks = new Keys([new PubKey(key, 100)], 100);
        return new Operation$1(this.networkID, new TransferFact$4(TimeStamp$1.new().UTC(), sender, [
            new TransferItem$1(ks.checksum, [new Amount(currency, amount)])
        ]));
    }
    /**
     * Generate a `create-account` operation for the multi-signature account.
     * @param {string | Address} [sender] - The sender's address.
     * @param {keysType} [keys] - An array of object {`key`: publickey, `weight`: weight for the key}
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | number | Big} [amount] - The initial amount. (to be paid by the sender)
     * @param {string | number | Big} [threshold] - The threshold for the multi-signature.
     * @returns `create-account` operation.
     * @example
     * // Example of parameter keys
     * const pubkey01 = {
     *     key: "02cb1d73c49d638d98092e35603414b575f3f5b5ce01162cdd80ab68ab77e50e14fpu",
     *     weight: 50
     * };
     * const pubkey02 = {
     *     key: "0377241675aabafca6b1a49f3bc08a581beb0daa330a4ac2008464d63ed7635a22fpu",
     *     weight: 50
     * };
     * const keysArray = [pubkey01, pubkey02];
     */
    createMultiSig(sender, keys, currency, amount, threshold) {
        return new Operation$1(this.networkID, new CreateAccountFact(TimeStamp$1.new().UTC(), sender, [
            new CreateAccountItem(new Keys(keys.map(k => k instanceof PubKey ? k : new PubKey(k.key, k.weight)), threshold), [new Amount(currency, amount)])
        ]));
    }
    /**
     * Generate an `update-key` operation for replace the public keys involved in given address.
     *
     * `update-key` cannot be used for single-sig accounts and CA accounts.
     * @param {string | Address} [sender] - The target account's address.
     * @param {keysType} [newKeys] - An array of object {`key`: publickey, `weight`: weight for the key}
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `update-key` operation.
     * @example
     * // Example of parameter keys
     * const pubkey01 = {
     *     key: "02a2e69d8b819e25ac4931523b62995bf3361304093dc24f15658d88e72644d853fpu",
     *     weight: 50
     * };
     * const pubkey02 = {
     *     key: "03410a28d1d44974f3af2b12f6d23733a17ea30e2ecfbc413055a4543b28f16f45fpu",
     *     weight: 50
     * };
     * const keysArray = [pubkey01, pubkey02];
     */
    updateKey(sender, newKeys, currency, threshold) {
        return new Operation$1(this.networkID, new UpdateKeyFact(TimeStamp$1.new().UTC(), sender, new Keys(newKeys.map(k => k instanceof PubKey ? k : new PubKey(k.key, k.weight)), threshold), currency));
    }
    /**
     * Sign and send the `transfer` operation to blockchain network to create single-sig account.
     * @async
     * @param {string | Key} [privatekey] - The private key used for signing.
     * @param {Object} [wallet] - The object with properties `wallet` and `operation`. (return value of `createWallet`)
     * @returns A Promise resolving to a `OperationResponse`. `.wait()` can be used like `operation.send`.
     *
     * Properties of `OperationResponse`:
     * - response: <SuccessResponse | ErrorResponse>
     * - _api: API URL
     * - _delegateIP: IP address for delegation
     * @example
     * // Send operation and check response and receipt:
     * const wallet = mitum.account.createWallet(...);
     * const touchOperation = async () => {
     *   const data = await mitum.account.touch(privatekey, wallet);
     *   console.log(data.response);
     *   const receipt = await data.wait();
     *   console.log(receipt);
     * };
     * touchOperation();
     */
    async touch(privatekey, wallet) {
        const op = wallet.operation;
        op.sign(privatekey);
        return await new Operation(this.networkID, this.api, this.delegateIP).send(op);
    }
    /**
     * Get account information for the given address.
     * @async
     * @param {string | Address} [address] - The account address to retrieve.
     * @returns `data` of `SuccessResponse` is *null* or account information:
     * - `_hint`: Hint for the account
     * - `hash`: Hash for the account state,
     * - `address`: Address of the account,
     * - `keys`: Object for keys,
     * - `balance`: Array with balance information,
     * - `height`: Latest block height associated with the account,
     * - `contract_account_status`: Object to indicate contract account status and related details
     *
     * **null means that the account has not yet been recorded in the block.**
     */
    async getAccountInfo(address) {
        Address.from(address);
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        const response = await getAPIData(() => api.account.getAccount(this.api, address, this.delegateIP));
        if (isSuccessResponse(response)) {
            response.data = response.data ? response.data : null;
        }
        return response;
    }
    /**
     * Get all operations corresponding the given account.
     * @async
     * @param {string | Address} [address] - The account address to retrieve.
     * @param {number} [limit] - (Optional) The maximum number of items to retrieve.
     * @param {number} [offset] - (Optional) The number of items skip before starting to return data.
     * @param {boolean} [reverse] - (Optional) Whether to return the items in reverse newest order.
     * @returns The `data` of `SuccessResponse` is *null* or an array of all operations corresponding the given account:
     * - `_hint`: Indicates mitum engine version,
     * - `_embedded`:
     * - - `_hint`: Hint for the operation,
     * - - `hash`: Hash for the fact,
     * - - `operation`: Information of the operation includes `hash`, `fact`, `signs`, `_hint`,
     * - - `height`: Block height containing the operation,
     * - - `confirmed_at`: Timestamp when the block was confirmed,
     * - - `reason`: Reason for operation failure,
     * - - `in_state`: Boolean indicating whether the operation was successful or not,
     * - - `index`: Index of the operation in the block
     * - `_links`: Links to get additional information

     * **null means that the account has not yet been recorded in the block.**
     */
    async getOperations(address, limit, offset, reverse) {
        Address.from(address);
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        const response = await getAPIData(() => api.operation.getAccountOperations(this.api, address, this.delegateIP, limit, offset, reverse));
        if (isSuccessResponse(response)) {
            response.data = response.data ? response.data : null;
        }
        return response;
    }
    /**
     * Get the account information for the given public key. Only accounts created through `create-account` operations can be retreived.
     * @async
     * @param {string | Key | PubKey} [publickey] - The public key to retrieve.
     * @returns `data` of `SuccessResponse` is a array with account informations:
     * - `_hint`: Indicates mitum engine version,
     * - `_embedded`:
     * - - `_hint`: Hint for the account
     * - - `hash`: Hash for the account state,
     * - - `address`: Address of the account,
     * - - `keys`: Object for keys,
     * - - `height`: Latest block height associated with the account,
     * - - `contract_account_status`: Object to indicate contract account status and related details
     * - `_links`: Links to get additional information
     */
    async getByPublickey(publickey) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        const s = typeof (publickey) === 'string' ? publickey : publickey.toString();
        StringAssert.with(s, MitumError.detail(ECODE.INVALID_PUBLIC_KEY, "invalid public key"))
            .empty().not()
            .chainAnd(s.endsWith(SUFFIX.KEY.MITUM.PUBLIC) && Config.KEY.MITUM.PUBLIC.satisfy(s.length), /^[0-9a-f]+$/.test(s.substring(0, s.length - Config.SUFFIX.DEFAULT.value)))
            .excute();
        return await getAPIData(() => api.account.getAccountByPublicKey(this.api, publickey, this.delegateIP));
    }
    /**
     * Get the currency balance of account for the given address.
     * @async
     * @param {string | Address} [address] - The account address to retrieve.
     * @returns `data` of `SuccessResponse` is *null* or a array with account informations:
     *  - `amount`: String of balance amount,
     *  - `currency`: Currency ID,
     *  - `_hint`: Hint for amount,

     * **null means that the account has not yet been recorded in the block.**
     */
    async balance(address) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(address);
        const response = await getAPIData(() => api.account.getAccount(this.api, address, this.delegateIP));
        if (isSuccessResponse(response) && response.data) {
            response.data = response.data.balance ? response.data.balance : null;
        }
        return response;
    }
}
class Contract extends KeyG {
    constructor(networkID, api, delegateIP) {
        super(networkID, api, delegateIP);
    }
    /**
     * Generate a key pair and the corresponding `create-contract-account` operation.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | number | Big} [amount] - The initial amount. (to be paid by the sender)
     * @param {string} [seed] - (Optional) The seed for deterministic key generation. If not provided, a random key pair will be generated.
     * @returns An object containing the wallet(key pair) and the `create-contract-account` operation.
     */
    createWallet(sender, currency, amount, seed) {
        const kp = seed ? KeyPair.fromSeed(seed, "mitum") : KeyPair.random("mitum");
        const ks = new Keys([new PubKey(kp.publicKey, 100)], 100);
        return {
            wallet: {
                privatekey: kp.privateKey.toString(),
                publickey: kp.publicKey.toString(),
                address: ks.checksum.toString()
            },
            operation: new Operation$1(this.networkID, new CreateContractAccountFact(TimeStamp$1.new().UTC(), sender, [
                new CreateContractAccountItem(ks, [new Amount(currency, amount)])
            ])),
        };
    }
    /**
     * Generate `n` number of key pairs and the corresponding `create-contract-account` operation with multiple items.
     * @param {string | Address} [sender] - The sender's address.
     * @param {number} [n] - The number of account to create.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | number | Big} [amount] - The initial amount. (to be paid by the sender)
     * @returns An object containing the wallet (key pairs) and the `create-contract-account` operation with multiple items.
     */
    createBatchWallet(sender, n, currency, amount) {
        const keyArray = this.keys(n);
        const items = keyArray.map((ks) => new CreateContractAccountItem(new Keys([new PubKey(ks.publickey, 100)], 100), [new Amount(currency, amount)]));
        return {
            wallet: keyArray,
            operation: new Operation$1(this.networkID, new CreateContractAccountFact(TimeStamp$1.new().UTC(), sender, items)),
        };
    }
    /**
     * Generate a `create-contract-account` operation for the given public key.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Key | PubKey} [key] - The public key or key object.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | number | Big} [amount] - The initial amount. (to be paid by the sender)
     * @returns `create-contract-account` operation.
     */
    createAccount(sender, key, currency, amount) {
        return new Operation$1(this.networkID, new CreateContractAccountFact(TimeStamp$1.new().UTC(), sender, [
            new CreateContractAccountItem(new Keys([new PubKey(key, 100)], 100), [new Amount(currency, amount)])
        ]));
    }
    /**
     * Get contract account information for the given address.
     * @async
     * @param {string | Address} [address] - The contract account address to retrieve.
     * @returns `data` of `SuccessResponse` is *null* or account information:
     * - `_hint`: Hint for the account
     * - `hash`: Hash for the account state,
     * - `address`: Address of the account,
     * - `keys`: Object for keys,
     * - `balance`: Array with balance information,
     * - `height`: Latest block height associated with the account,
     * - `contract_account_status`: Object to indicate contract account status and related details

     * **null means that the contract account has not yet been recorded in the block.**
     */
    async getContractInfo(address) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(address);
        const response = await getAPIData(() => api.account.getAccount(this.api, address, this.delegateIP));
        if (isSuccessResponse(response)) {
            response.data = response.data ? response.data : null;
        }
        return response;
    }
    /**
     * Generate an `update-handler` operation to update handlers of contract to given accounts.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [contract] - The contract account address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {(string | Address)[]} [handlers] - The array of addresses to be updated as handlers.
     * @returns `update-handler` operation.
     */
    updateHandler(sender, contract, currency, handlers) {
        return new Operation$1(this.networkID, new UpdateHandlerFact(TimeStamp$1.new().UTC(), sender, contract, currency, handlers));
    }
    /**
     * Sign and send the `create-contract-account` operation to blockchain network.
     * @async
     * @param {string | Key} [privatekey] - The private key used for signing.
     * @param {Object} [wallet] - The object with properties `wallet` and `operation`. (return value of `createWallet`)
     * @returns A Promise resolving to a `OperationResponse`. `.wait()` can be used like `operation.send`.
     *
     * Properties of `OperationResponse`:
     * - response: <SuccessResponse | ErrorResponse>
     * - _api: API URL
     * - _delegateIP: IP address for delegation
     * @example
     * // Send operation and check response and receipt:
     * const wallet = mitum.contract.createWallet(...);

     * const touchOperation = async () => {
     *   const data = await mitum.contract.touch(privatekey, wallet);
     *   console.log(data.response);
     *   const receipt = await data.wait();
     *   console.log(receipt);
     * };
     * touchOperation();
     */
    async touch(privatekey, wallet) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        const op = wallet.operation;
        op.sign(privatekey);
        return await new Operation(this.networkID, this.api, this.delegateIP).send(op);
    }
}

let RegisterModelFact$7 = class RegisterModelFact extends ContractFact {
    constructor(token, sender, contract, name, royalty, uri, minterWhitelist, currency) {
        super(HINT.NFT.REGISTER_MODEL.FACT, token, sender, contract, currency);
        this.name = LongString.from(name);
        this.royalty = Big.from(royalty);
        this.uri = LongString.from(uri);
        this.minterWhitelist = minterWhitelist ? minterWhitelist.map(w => Address.from(w)) : [];
        Assert.check(Config.NFT.ROYALTY.satisfy(this.royalty.v), MitumError.detail(ECODE.INVALID_FACT, "royalty out of range"));
        ArrayAssert.check(this.minterWhitelist, "whitelist")
            .rangeLength(Config.NFT.ADDRESS_IN_MINTER_WHITELIST)
            .noDuplicates();
        this.minterWhitelist.forEach(account => Assert.check(this.contract.toString() !== account.toString(), MitumError.detail(ECODE.INVALID_FACT, "contract is same with whitelist address")));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.name.toBuffer(),
            this.royalty.toBuffer("fill"),
            this.uri.toBuffer(),
            this.currency.toBuffer(),
            Buffer.concat(this.minterWhitelist.sort(SortFunc).map(w => w.toBuffer())),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            name: this.name.toString(),
            royalty: this.royalty.v,
            uri: this.uri.toString(),
            minter_whitelist: this.minterWhitelist.sort(SortFunc).map(w => w.toString()),
        };
    }
    get operationHint() {
        return HINT.NFT.REGISTER_MODEL.OPERATION;
    }
};

let UpdateModelConfigFact$1 = class UpdateModelConfigFact extends ContractFact {
    constructor(token, sender, contract, name, royalty, uri, minterWhitelist, currency) {
        super(HINT.NFT.UPDATE_MODEL_CONFIG.FACT, token, sender, contract, currency);
        this.name = LongString.from(name);
        this.royalty = Big.from(royalty);
        this.uri = LongString.from(uri);
        this.minterWhitelist = minterWhitelist ? minterWhitelist.map(w => Address.from(w)) : [];
        Assert.check(Config.NFT.ROYALTY.satisfy(this.royalty.v), MitumError.detail(ECODE.INVALID_FACT, "royalty out of range"));
        ArrayAssert.check(this.minterWhitelist, "whitelist")
            .rangeLength(Config.NFT.ADDRESS_IN_MINTER_WHITELIST)
            .noDuplicates();
        this.minterWhitelist.forEach(account => Assert.check(this.contract.toString() !== account.toString(), MitumError.detail(ECODE.INVALID_FACT, "contract is same with whitelist address")));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.name.toBuffer(),
            this.royalty.toBuffer("fill"),
            this.uri.toBuffer(),
            this.currency.toBuffer(),
            Buffer.concat(this.minterWhitelist.sort(SortFunc).map(w => w.toBuffer())),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            name: this.name.toString(),
            royalty: this.royalty.v,
            uri: this.uri.toString(),
            minter_whitelist: this.minterWhitelist.sort(SortFunc).map(w => w.toString()),
        };
    }
    get operationHint() {
        return HINT.NFT.UPDATE_MODEL_CONFIG.OPERATION;
    }
};

class NFTItem extends Item {
    constructor(hint, contract, currency) {
        super(hint);
        this.contract = Address.from(contract);
        this.currency = CurrencyID.from(currency);
    }
    toBuffer() {
        return this.contract.toBuffer();
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            contract: this.contract.toString(),
            currency: this.currency.toString(),
        };
    }
    toString() {
        return this.contract.toString();
    }
}

class MintItem extends NFTItem {
    constructor(contract, receiver, hash, uri, creators, currency) {
        super(HINT.NFT.MINT.ITEM, contract, currency);
        Assert.check(Config.NFT.HASH.satisfy(hash.toString().length), MitumError.detail(ECODE.INVALID_LENGTH, "hash length is out of range"));
        Assert.check(Config.NFT.URI.satisfy(uri.toString().length), MitumError.detail(ECODE.INVALID_LENGTH, "uri length is out of range"));
        this.receiver = Address.from(receiver);
        this.hash = LongString.from(hash);
        this.uri = LongString.from(uri);
        this.creators = creators;
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.receiver.toBuffer(),
            this.hash.toBuffer(),
            this.uri.toBuffer(),
            this.creators.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            receiver: this.receiver.toString(),
            hash: this.hash.toString(),
            uri: this.uri.toString(),
            creators: this.creators.toHintedObject(),
        };
    }
}
let MintFact$2 = class MintFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.NFT.MINT.FACT, token, sender, items);
        this.items.forEach(it => {
            Assert.check(this.sender.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
            Assert.check(it.receiver.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "receiver is same with contract address"));
            it.creators.signers.forEach(signer => {
                Assert.check(signer.account.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "creator is same with contract address"));
            });
        });
    }
    get operationHint() {
        return HINT.NFT.MINT.OPERATION;
    }
};

class ApproveItem extends NFTItem {
    constructor(contract, approved, nftIdx, currency) {
        super(HINT.NFT.APPROVE.ITEM, contract, currency);
        this.approved = Address.from(approved);
        this.nftIdx = Big.from(nftIdx);
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.approved.toBuffer(),
            this.nftIdx.toBuffer("fill"),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            approved: this.approved.toString(),
            nft_idx: this.nftIdx.v,
        };
    }
    toString() {
        return `${super.toString()}-${this.nftIdx.v}`;
    }
}
let ApproveFact$2 = class ApproveFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.NFT.APPROVE.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate approve found in items"));
        this.items.forEach(it => {
            Assert.check(this.sender.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
            Assert.check(it.approved.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "approved is same with contract address"));
        });
    }
    get operationHint() {
        return HINT.NFT.APPROVE.OPERATION;
    }
};

class ApproveAllItem extends NFTItem {
    constructor(contract, approved, mode, currency) {
        super(HINT.NFT.APPROVE_ALL.ITEM, contract, currency);
        this.approved = Address.from(approved);
        this.mode = mode;
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.approved.toBuffer(),
            Buffer.from(this.mode),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            approved: this.approved.toString(),
            mode: this.mode,
        };
    }
    toString() {
        return `${super.toString()}-${this.approved.toString()}`;
    }
}
class ApproveAllFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.NFT.APPROVE_ALL.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate approved found in items"));
        this.items.forEach(it => {
            Assert.check(this.sender.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
            Assert.check(it.approved.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "approved is same with contract address"));
            Assert.check(this.sender.toString() != it.approved.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with approved address"));
        });
    }
    get operationHint() {
        return HINT.NFT.APPROVE_ALL.OPERATION;
    }
}

class TransferItem extends NFTItem {
    constructor(contract, receiver, nftIdx, currency) {
        super(HINT.NFT.TRANSFER.ITEM, contract, currency);
        this.receiver = Address.from(receiver);
        this.nftIdx = Big.from(nftIdx);
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.receiver.toBuffer(),
            this.nftIdx.toBuffer("fill"),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            receiver: this.receiver.toString(),
            nft_idx: this.nftIdx.v,
        };
    }
    toString() {
        return `${super.toString()}-${this.nftIdx.toString()}`;
    }
}
let TransferFact$3 = class TransferFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.NFT.TRANSFER.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate nft found in items"));
        this.items.forEach(it => {
            Assert.check(this.sender.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
            Assert.check(it.receiver.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "receiver is same with contract address"));
        });
    }
    get operationHint() {
        return HINT.NFT.TRANSFER.OPERATION;
    }
};

class AddSignatureItem extends NFTItem {
    constructor(contract, nftIdx, currency) {
        super(HINT.NFT.ADD_SIGNATURE.ITEM, contract, currency);
        this.nftIdx = Big.from(nftIdx);
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.nftIdx.toBuffer("fill"),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            nft_idx: this.nftIdx.v,
        };
    }
}
class AddSignatureFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.NFT.ADD_SIGNATURE.FACT, token, sender, items);
        this.items.forEach(it => Assert.check(this.sender.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address")));
    }
    get operationHint() {
        return HINT.NFT.ADD_SIGNATURE.OPERATION;
    }
}

let Signer$1 = class Signer {
    constructor(account, share, signed) {
        this.hint = new Hint(HINT.NFT.SIGNER);
        this.account = Address.from(account);
        this.share = Big.from(share);
        this.signed = Bool.from(signed);
        Assert.check(Config.NFT.SHARE.satisfy(this.share.v), MitumError.detail(ECODE.NFT.INVALID_NFT_SIGNER, "share out of range"));
    }
    toBuffer() {
        return Buffer.concat([
            this.account.toBuffer(),
            this.share.toBuffer("fill"),
            this.signed.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            _hint: this.hint.toString(),
            account: this.account.toString(),
            share: this.share.v,
            signed: this.signed.v,
        };
    }
};
class Signers {
    constructor(signers) {
        this.hint = new Hint(HINT.NFT.SIGNERS);
        this.signers = signers;
        const total = this.signers.reduce((prev, next) => prev + Big.from(next.share).v, 0);
        Assert.check(total <= 100, MitumError.detail(ECODE.NFT.INVALID_NFT_SIGNERS, `total share over max, ${total} > 100`));
        Assert.check(Config.NFT.SIGNERS_IN_SIGNERS.satisfy(this.signers.length), MitumError.detail(ECODE.NFT.INVALID_NFT_SIGNERS, "signers length out of range"));
    }
    toBuffer() {
        return Buffer.concat([
            Buffer.concat(this.signers.sort(SortFunc).map(s => s.toBuffer())),
        ]);
    }
    toHintedObject() {
        return {
            _hint: this.hint.toString(),
            signers: this.signers.sort(SortFunc).map(s => s.toHintedObject()),
        };
    }
}

class NFT extends ContractGenerator {
    constructor(networkID, api, delegateIP) {
        super(networkID, api, delegateIP);
    }
    /**
     * Generate `register-model` operation to register a new NFT model for creating a collection on the contract.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {collectionData} [data] - The collection data to be registed. The properties of `collectionData` include:
     * - {string | LongString} `name` - The name of the NFT collection.
     * - {string | LongString} `uri` - The uri of the NFT collection.
     * - {string | number | Big} `royalty` - The royalty of the NFT collection.
     * - {(string | Address)[]} `minterWhitelist` - Accounts who have permissions to mint. If it's empty, anyone can mint.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `register-model` operation
     */
    registerModel(contract, sender, data, currency) {
        const keysToCheck = ['name', 'uri', 'royalty', 'minterWhitelist'];
        keysToCheck.forEach((key) => {
            Assert.check(data[key] !== undefined, MitumError.detail(ECODE.INVALID_DATA_STRUCTURE, `${key} is undefined, check the collectionData structure`));
        });
        return new Operation$1(this.networkID, new RegisterModelFact$7(TimeStamp$1.new().UTC(), sender, contract, data.name, data.royalty, data.uri, data.minterWhitelist, currency));
    }
    /**
     * Generate `update-model-config` operation to update the policy of the nft collection on the contract.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {collectionData} [data] - The policy data for nft collection to be updated. The properties of `collectionData` include:
     * - {string | LongString} `name` - The name of the NFT collection.
     * - {string | LongString} `uri` - The uri of the NFT collection.
     * - {string | number | Big} `royalty` - The royalty of the NFT collection.
     * - {(string | Address)[]} `minterWhitelist` - Accounts who have permissions to mint.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `update-model-config` operation.
     */
    updateModelConfig(contract, sender, data, currency) {
        const keysToCheck = ['name', 'uri', 'royalty', 'minterWhitelist'];
        keysToCheck.forEach((key) => {
            Assert.check(data[key] !== undefined, MitumError.detail(ECODE.INVALID_DATA_STRUCTURE, `${key} is undefined, check the collectionData structure`));
        });
        return new Operation$1(this.networkID, new UpdateModelConfigFact$1(TimeStamp$1.new().UTC(), sender, contract, data.name, data.royalty, data.uri, data.minterWhitelist, currency));
    }
    /**
     * Generate `mint` operation for minting a new NFT and assigns it to a receiver.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [receiver] - The address of the receiver of the newly minted NFT.
     * @param {string | LongString} [uri] - The URI of the NFT to mint.
     * @param {string | LongString} [hash] - The hash of the NFT to mint.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | Address} [creator] - The address of the creator of the artwork for NFT.
     * @returns `mint` operation.
     */
    mint(contract, sender, receiver, uri, hash, currency, creator) {
        return new Operation$1(this.networkID, new MintFact$2(TimeStamp$1.new().UTC(), sender, [new MintItem(contract, receiver, hash, uri, new Signers([new Signer$1(creator, 100, false)]), currency)]));
    }
    /**
     * Generate `mint` operation with multiple item for minting multiple NFT and assigns it to a receiver.
     * @param {string | Address | string[] | Address[]} [contract] - A single contract address (converted to an array) or an array of multiple contract addresses.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [receivers] - The array of address of the receiver of the newly minted NFT.
     * @param {string | LongString} [uri] - The array of URI for the NFTs to mint.
     * @param {string | LongString} [hash] - The array of hash for the NFT to mint.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | Address} [creator] - The address of the creator of the artwork for NFT.
     * @returns `mint` operation.
     */
    multiMint(contract, sender, receivers, uri, hash, currency, creator) {
        ArrayAssert.check(receivers, "receivers").rangeLength(Config.ITEMS_IN_FACT).sameLength(uri, "uri").sameLength(hash, "hash");
        const contractsArray = convertToArray(contract, receivers.length);
        const items = Array.from({ length: receivers.length }).map((_, idx) => new MintItem(contractsArray[idx], receivers[idx], hash[idx], uri[idx], new Signers([new Signer$1(creator, 100, false)]), currency));
        return new Operation$1(this.networkID, new MintFact$2(TimeStamp$1.new().UTC(), sender, items));
    }
    /**
     * Generate `mint` operation in case of multiple creators.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [receiver] - The address of the receiver of the newly minted NFT.
     * @param {string | LongString} [uri] - The URI of the NFT to mint.
     * @param {string | LongString} [hash] - The hash of the NFT to mint.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {Creator[]} [creators] - An array of Creator object which has address of the creator of the artwork for NFT with their respective shares. The properties of `Creator` include:
     * - {string | Address} `account` - The creator's address.
     * - {string | number | Big} `share` - The share for the artworks. The total share can not over 100.
     * @returns `mint` operation.
     */
    mintForMultiCreators(contract, sender, receiver, uri, hash, currency, creators) {
        const keysToCheck = ['account', 'share'];
        keysToCheck.forEach((key) => {
            creators.forEach((creator) => {
                Assert.check(creator[key] !== undefined, MitumError.detail(ECODE.INVALID_DATA_STRUCTURE, `${key} is undefined, check the Creator structure`));
            });
        });
        return new Operation$1(this.networkID, new MintFact$2(TimeStamp$1.new().UTC(), sender, [
            new MintItem(contract, receiver, hash, uri, new Signers(creators.map(a => new Signer$1(a.account, a.share, false))), currency)
        ]));
    }
    /**
     * Generate `transfer` operation for transferring an NFT from one address to another.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [receiver] - The address of the receiver of the NFT.
     * @param {string | number | Big} [nftIdx] - The index of the NFT (Indicate the order of minted).
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `transfer` operation.
     */
    transfer(contract, sender, receiver, nftIdx, currency) {
        const fact = new TransferFact$3(TimeStamp$1.new().UTC(), sender, [
            new TransferItem(contract, receiver, nftIdx, currency)
        ]);
        return new Operation$1(this.networkID, fact);
    }
    /**
     * Generate `transfer` operation with multiple itmes to transfer NFTs from one address to another.
     * @param {string | Address | string[] | Address[]} [contract] - A single contract address (converted to an array) or an array of multiple contract addresses.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string[] | Address[]} [receiver] - The array of address of the receiver of the NFT.
     * @param {string[] | number[] | Big[]} [nftIdx] - The array of index of the NFT (Indicate the order of minted).
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `transfer` operation with multiple items.
     */
    multiTransfer(contract, sender, receiver, nftIdx, currency) {
        ArrayAssert.check(receiver, "receiver").rangeLength(Config.ITEMS_IN_FACT).sameLength(nftIdx, "nftIdx");
        const contractsArray = convertToArray(contract, receiver.length);
        const items = Array.from({ length: receiver.length }).map((_, idx) => new TransferItem(contractsArray[idx], receiver[idx], nftIdx[idx], currency));
        return new Operation$1(this.networkID, new TransferFact$3(TimeStamp$1.new().UTC(), sender, items));
    }
    /**
     * Generate `approve` operation to approve NFT to another account (approved).
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The address of the sender of the NFT.
     * @param {string | Address} [approved] - The address being granted approval to manage the NFT.
     * @param {string | number | Big} [nftIdx] - The index of the NFT (Indicate the order of minted).
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `approve` operation.
     */
    approve(contract, sender, approved, nftIdx, currency) {
        return new Operation$1(this.networkID, new ApproveFact$2(TimeStamp$1.new().UTC(), sender, [
            new ApproveItem(contract, approved, nftIdx, currency)
        ]));
    }
    /**
     * Generate `approve` operation with multiple items to approve NFT to another account (approved).
     * @param {string | Address | string[] | Address[]} [contract] - A single contract address (converted to an array) or an array of multiple contract addresses.
     * @param {string | Address} [sender] - The address of the sender of the NFT.
     * @param {string[] | Address[]} [approved] - The array of address being granted approval to manage the NFT.
     * @param {string[] | number[] | Big[]} [nftIdx] - The index of the NFT (Indicate the order of minted).
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `approve` operation with multiple items.
     */
    multiApprove(contract, sender, approved, nftIdx, currency) {
        ArrayAssert.check(approved, "approved").rangeLength(Config.ITEMS_IN_FACT).sameLength(nftIdx, "nftIdx");
        const contractsArray = convertToArray(contract, approved.length);
        const items = Array.from({ length: approved.length }).map((_, idx) => new ApproveItem(contractsArray[idx], approved[idx], nftIdx[idx], currency));
        return new Operation$1(this.networkID, new ApproveFact$2(TimeStamp$1.new().UTC(), sender, items));
    }
    /**
     * Generate `approve-all` operation to grant or revoke approval for an account to manage all NFTs of the sender.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The address of the sender giving or revoking approval.
     * @param {string | Address} [approved] - The address being granted or denied approval to manage all NFTs.
     * @param {"allow" | "cancel"} [mode] - The mode indicating whether to allow or cancel the approval.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `approve-all` operation.
     */
    approveAll(contract, sender, approved, mode, currency) {
        return new Operation$1(this.networkID, new ApproveAllFact(TimeStamp$1.new().UTC(), sender, [
            new ApproveAllItem(contract, approved, mode, currency)
        ]));
    }
    /**
     * Generate `approve-all` operation with multiple items to grant or revoke approval for an account to manage all NFTs of the sender.
     * @param {string | Address | string[] | Address[]} [contract] - A single contract address (converted to an array) or an array of multiple contract addresses.
     * @param {string | Address} [sender] - The address of the sender giving or revoking approval.
     * @param {string | Address} [approved] - The address being granted or denied approval to manage all NFTs.
     * @param {"allow" | "cancel"} [mode] - The mode indicating whether to allow or cancel the approval.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `approve-all` operation with multiple items.
     */
    multiApproveAll(contract, sender, approved, mode, currency) {
        ArrayAssert.check(approved, "approved").rangeLength(Config.ITEMS_IN_FACT);
        const contractsArray = convertToArray(contract, approved.length);
        const items = Array.from({ length: approved.length }).map((_, idx) => new ApproveAllItem(contractsArray[idx], approved[idx], mode, currency));
        return new Operation$1(this.networkID, new ApproveAllFact(TimeStamp$1.new().UTC(), sender, items));
    }
    /**
     * Generate `add-signature` operation to signs an NFT as creator of the artwork.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The address of the creator signing the NFT.
     * @param {string | number | Big} [nftIdx] - The index of the NFT (Indicate the order of minted).
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `sign` operation.
     */
    addSignature(contract, sender, nftIdx, currency) {
        return new Operation$1(this.networkID, new AddSignatureFact(TimeStamp$1.new().UTC(), sender, [
            new AddSignatureItem(contract, nftIdx, currency)
        ]));
    }
    /**
     * Get information about an NFT collection on the contract.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @returns `data` of `SuccessResponse` is information about the NFT collection:
     * - `_hint`: Hint for NFT design,
     * - `contract`: Address of the contract account,
     * - `creator`: Address of the creator,
     * - `active`: Bool represents activation,
     * - `policy`:
     * - - `_hint`: Hint for the NFT collection policy,
     * - - `name`: Name of the NFT collection,
     * - - `royalty`: Royalty of the NFT collection,
     * - - `uri`: URI of the NFT collection,
     * - - `minter_whitelist`: Array of the addresses of accounts who have permissions to mint
     */
    async getModelInfo(contract) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        return await getAPIData(() => contractApi.nft.getModel(this.api, contract, this.delegateIP));
    }
    /**
     * Get the owner of a specific NFT.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | number | Big} [nftIdx] - The index of the NFT (Indicate the order of minted).
     * @returns `data` of `SuccessResponse` is the address of the NFT owner.
     */
    async getOwner(contract, nftIdx) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        const response = await getAPIData(() => contractApi.nft.getNFT(this.api, contract, nftIdx, this.delegateIP));
        if (isSuccessResponse(response) && response.data) {
            response.data = response.data.owner ? response.data.owner : null;
        }
        return response;
    }
    /**
     * Get the address approved to manage a specific NFT.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {number} [nftIdx] - The index of the NFT (Indicate the order of minted).
     * @returns `data` of `SuccessResponse` is an address of the approved account to manage the NFT.
     */
    async getApproved(contract, nftIdx) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        const response = await getAPIData(() => contractApi.nft.getNFT(this.api, contract, nftIdx, this.delegateIP));
        if (isSuccessResponse(response) && response.data) {
            response.data = response.data.approved ? response.data.approved : null;
        }
        return response;
    }
    /**
     * Get the total supply of NFTs in a collection on the contract.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @returns `data` of `SuccessResponse` is the total supply of NFTs in the collection.
     */
    async getTotalSupply(contract) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        const response = await getAPIData(() => contractApi.nft.getNFTCount(this.api, contract, this.delegateIP));
        if (isSuccessResponse(response) && response.data) {
            response.data = response.data.nft_total_supply ? Number(response.data.nft_total_supply) : 0;
        }
        return response;
    }
    /**
     * Get the URI of a specific NFT.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {number} [nftIdx] - The index of the NFT (Indicate the order of minted).
     * @returns `data` of `SuccessResponse` is the URI of the NFT.
     */
    async getURI(contract, nftIdx) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        const response = await getAPIData(() => contractApi.nft.getNFT(this.api, contract, nftIdx, this.delegateIP));
        if (isSuccessResponse(response) && response.data) {
            response.data = response.data.uri ? response.data.uri : null;
        }
        return response;
    }
    /**
     * Get the address is approved to manage all NFTs of a sepecfic owner.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string} [owner] - The address of the NFT owner.
     * @returns `data` of `SuccessResponse` is approval information:
     * - `_hint`: Hint for NFT operators book,
     * - `operators`: Array of the addresses of accounts that have been delegated authority over all of the owner’s NFTs
     */
    async getApprovedAll(contract, owner) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        Address.from(owner);
        return await getAPIData(() => contractApi.nft.getAccountOperators(this.api, contract, owner, this.delegateIP));
    }
    /**
     * Get detailed information about a specific NFT.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {number} [nftIdx] - The index of the NFT (Indicate the order of minted).
     * @returns `data` of `SuccessResponse` is detailed information about the NFT:
     * - `_hint`: Hint for NFT,
     * - `nft_idx`: Index of the NFT,
     * - `active`: Bool represents activation,
     * - `owner`: Address of the owner,
     * - `hash`: Hash for the NFT,
     * - `uri`: URI for the NFT,
     * - `approved`: Address of the approved account for the NFT,
     * - `creators`: Creator object,
     */
    async getNFT(contract, nftIdx) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        return await getAPIData(() => contractApi.nft.getNFT(this.api, contract, nftIdx, this.delegateIP));
    }
    /**
     * Get information of all NFTs in a collection. If the optional parameter factHash is given, only the nft created by the operation is searched.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {number} [factHash] - (Optional) The hash of fact in the operation that minted NFT.
     * @param {number} [limit] - (Optional) The maximum number of items to retrieve.
     * @param {number} [offset] - (Optional) The number of items skip before starting to return data.
     * @param {boolean} [reverse] - (Optional) Whether to return the items in reverse newest order.
     * @returns `data` of `SuccessResponse` is an array of the information about all NFTs in the NFT collection:
     * - `_hint`: Hint for currency,
     * - `_embedded`:
     * - - `_hint`: Hint for NFT,
     * - - `nft_idx`: Index of the NFT,
     * - - `active`: Bool represents activation,
     * - - `owner`: Address of the owner,
     * - - `hash`: Hash for the NFT,
     * - - `uri`: URI for the NFT,
     * - - `approved`: Address of the approved account for the NFT,
     * - - `creators`: Creator object,
     * - `_links`: Links for additional information
     */
    async getNFTs(contract, factHash, limit, offset, reverse) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        return await getAPIData(() => contractApi.nft.getNFTs(this.api, contract, this.delegateIP, factHash, limit, offset, reverse));
    }
}

let RegisterModelFact$6 = class RegisterModelFact extends ContractFact {
    constructor(token, sender, contract, currency) {
        super(HINT.CREDENTIAL.REGISTER_MODEL.FACT, token, sender, contract, currency);
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    get operationHint() {
        return HINT.CREDENTIAL.REGISTER_MODEL.OPERATION;
    }
};

class AddTemplateFact extends ContractFact {
    constructor(token, sender, contract, templateID, templateName, serviceDate, expirationDate, templateShare, multiAudit, displayName, subjectKey, description, creator, currency) {
        super(HINT.CREDENTIAL.ADD_TEMPLATE.FACT, token, sender, contract, currency);
        this.templateID = templateID;
        this.templateName = templateName;
        this.serviceDate = ShortDate.from(serviceDate);
        this.expirationDate = ShortDate.from(expirationDate);
        this.templateShare = Bool.from(templateShare);
        this.multiAudit = Bool.from(multiAudit);
        this.displayName = displayName;
        this.subjectKey = subjectKey;
        this.description = description;
        this.creator = Address.from(creator);
        Assert.check(contract.toString() !== sender.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
        Assert.check(contract.toString() !== creator.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "creator is same with contract address"));
        Assert.check(Config.CREDENTIAL.TEMPLATE_ID.satisfy(templateID.length), MitumError.detail(ECODE.INVALID_FACT, "template id length out of range"));
        Assert.check(Config.CREDENTIAL.TEMPLATE_NAME.satisfy(templateName.length), MitumError.detail(ECODE.INVALID_FACT, "template name length out of range"));
        Assert.check(Config.CREDENTIAL.DISPLAY_NAME.satisfy(displayName.length), MitumError.detail(ECODE.INVALID_FACT, "display name length out of range"));
        Assert.check(Config.CREDENTIAL.SUBJECT_KEY.satisfy(subjectKey.length), MitumError.detail(ECODE.INVALID_FACT, "subject key length out of range"));
        Assert.check(Config.CREDENTIAL.DESCRIPTION.satisfy(description.length), MitumError.detail(ECODE.INVALID_FACT, "description length out of range"));
        Assert.check(Date.parse(serviceDate.toString()) <= Date.parse(expirationDate.toString()), MitumError.detail(ECODE.INVALID_FACT, "expire date < service date"));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            Buffer.from(this.templateID),
            Buffer.from(this.templateName),
            this.serviceDate.toBuffer(),
            this.expirationDate.toBuffer(),
            this.templateShare.toBuffer(),
            this.multiAudit.toBuffer(),
            Buffer.from(this.displayName),
            Buffer.from(this.subjectKey),
            Buffer.from(this.description),
            this.creator.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            template_id: this.templateID,
            template_name: this.templateName,
            service_date: this.serviceDate.toString(),
            expiration_date: this.expirationDate.toString(),
            template_share: this.templateShare.v,
            multi_audit: this.multiAudit.v,
            display_name: this.displayName,
            subject_key: this.subjectKey,
            description: this.description,
            creator: this.creator.toString(),
        };
    }
    get operationHint() {
        return HINT.CREDENTIAL.ADD_TEMPLATE.OPERATION;
    }
}

class CredentialItem extends Item {
    constructor(hint, contract, holder, templateID, credentialID, currency) {
        super(hint);
        this.contract = Address.from(contract);
        this.holder = Address.from(holder);
        this.templateID = templateID;
        this.credentialID = credentialID;
        this.currency = CurrencyID.from(currency);
        Assert.check(Config.CREDENTIAL.TEMPLATE_ID.satisfy(templateID.length), MitumError.detail(ECODE.INVALID_ITEM, "template id length out of range"));
        Assert.check(Config.CREDENTIAL.ID.satisfy(credentialID.length), MitumError.detail(ECODE.INVALID_ITEM, "credential id length out of range"));
        Assert.check(this.contract.toString() !== this.holder.toString(), MitumError.detail(ECODE.INVALID_ITEM, "holder is same with contract address"));
    }
    toBuffer() {
        return Buffer.concat([
            this.contract.toBuffer(),
            this.holder.toBuffer(),
            Buffer.from(this.templateID),
            Buffer.from(this.credentialID),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            contract: this.contract.toString(),
            holder: this.holder.toString(),
            template_id: this.templateID,
            credential_id: this.credentialID,
            currency: this.currency.toString(),
        };
    }
    toString() {
        return this.contract.toString();
    }
}

let IssueItem$1 = class IssueItem extends CredentialItem {
    constructor(contract, holder, templateID, credentialID, value, validFrom, validUntil, did, currency) {
        super(HINT.CREDENTIAL.ISSUE.ITEM, contract, holder, templateID, credentialID, currency);
        this.value = value;
        this.validFrom = Big.from(validFrom);
        this.validUntil = Big.from(validUntil);
        this.did = did;
        Assert.check(Config.CREDENTIAL.VALUE.satisfy(value.length), MitumError.detail(ECODE.INVALID_ITEM, "credential value length out of range"));
        Assert.check(validFrom < validUntil, MitumError.detail(ECODE.INVALID_ITEM, "valid until <= valid from"));
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            Buffer.from(this.value),
            this.validFrom.toBuffer("fill"),
            this.validUntil.toBuffer("fill"),
            Buffer.from(this.did),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            value: this.value,
            valid_from: this.validFrom.v,
            valid_until: this.validUntil.v,
            did: this.did,
        };
    }
    toString() {
        return `${super.toString()}-${this.templateID}-${this.credentialID}`;
    }
};
let IssueFact$2 = class IssueFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.CREDENTIAL.ISSUE.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, `each item's combination of contract-templateID-credentialID must be unique`));
        items.forEach(item => {
            Assert.check(item.contract.toString() !== sender.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
        });
    }
    get operationHint() {
        return HINT.CREDENTIAL.ISSUE.OPERATION;
    }
};

class RevokeItem extends CredentialItem {
    constructor(contract, holder, templateID, credentialID, currency) {
        super(HINT.CREDENTIAL.REVOKE.ITEM, contract, holder, templateID, credentialID, currency);
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toString() {
        return `${super.toString()}-${this.templateID}-${this.credentialID}`;
    }
}
class RevokeFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.CREDENTIAL.REVOKE.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, `each item's combination of contract-templateID-credentialID must be unique`));
        items.forEach(item => {
            Assert.check(item.contract.toString() !== sender.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
        });
    }
    get operationHint() {
        return HINT.CREDENTIAL.REVOKE.OPERATION;
    }
}

class Credential extends ContractGenerator {
    constructor(networkID, api, delegateIP) {
        super(networkID, api, delegateIP);
    }
    /**
     * Generate a `register-model` operation to register new credential model on the contract.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `register-model` operation.
     */
    registerModel(contract, sender, currency) {
        return new Operation$1(this.networkID, new RegisterModelFact$6(TimeStamp$1.new().UTC(), sender, contract, currency));
    }
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
    addTemplate(contract, sender, data, currency) {
        const keysToCheck = ['templateID', 'templateName', 'serviceDate', 'expirationDate', 'templateShare', 'multiAudit', 'displayName', 'subjectKey', 'description', 'creator'];
        keysToCheck.forEach((key) => {
            const s = data[key];
            Assert.check(s !== undefined, MitumError.detail(ECODE.INVALID_DATA_STRUCTURE, `${key} is undefined, check the templateData structure`));
        });
        new URIString(data['templateID'], 'templateID');
        return new Operation$1(this.networkID, new AddTemplateFact(TimeStamp$1.new().UTC(), sender, contract, data.templateID, data.templateName, data.serviceDate, data.expirationDate, data.templateShare, data.multiAudit, data.displayName, data.subjectKey, data.description, data.creator, currency));
    }
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
    issue(contract, sender, data, currency) {
        const keysToCheck = ['holder', 'templateID', 'credentialID', 'value', 'validFrom', 'validUntil', 'did'];
        keysToCheck.forEach((key) => {
            const s = data[key];
            Assert.check(s !== undefined, MitumError.detail(ECODE.INVALID_DATA_STRUCTURE, `${key} is undefined, check the templateData structure`));
        });
        new URIString(data['templateID'], 'templateID');
        new URIString(data['credentialID'], 'credentialID');
        return new Operation$1(this.networkID, new IssueFact$2(TimeStamp$1.new().UTC(), sender, [
            new IssueItem$1(contract, data.holder, data.templateID, data.credentialID, data.value, data.validFrom, data.validUntil, data.did, currency)
        ]));
    }
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
    revoke(contract, sender, holder, templateID, credentialID, currency) {
        new URIString(templateID, 'templateID');
        new URIString(credentialID, 'credentialID');
        return new Operation$1(this.networkID, new RevokeFact(TimeStamp$1.new().UTC(), sender, [
            new RevokeItem(contract, holder, templateID, credentialID, currency)
        ]));
    }
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
    async getModelInfo(contract) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        return await getAPIData(() => contractApi.credential.getModel(this.api, contract, this.delegateIP));
    }
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
    async getCredential(contract, templateID, credentialID) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        new URIString(templateID, 'templateID');
        new URIString(credentialID, 'credentialID');
        return await getAPIData(() => contractApi.credential.getCredential(this.api, contract, templateID, credentialID, this.delegateIP));
    }
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
    async getTemplate(contract, templateID) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        new URIString(templateID, 'templateID');
        return await getAPIData(() => contractApi.credential.getTemplate(this.api, contract, templateID, this.delegateIP));
    }
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
    async getAllCredentials(contract, templateID) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        new URIString(templateID, 'templateID');
        return await getAPIData(() => contractApi.credential.getCredentials(this.api, contract, templateID, this.delegateIP));
    }
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
    async getByHolder(contract, holder) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        Address.from(holder);
        return await getAPIData(() => contractApi.credential.getCredentialByHolder(this.api, contract, holder, this.delegateIP));
    }
}

let RegisterModelFact$5 = class RegisterModelFact extends ContractFact {
    constructor(votingPowerToken, sender, contract, option, policy, currency) {
        super(HINT.DAO.REGISTER_MODEL.FACT, votingPowerToken, sender, contract, currency);
        this.option = option;
        this.policy = policy;
        this.policy.proposerWhitelist.accounts.forEach(account => Assert.check(this.contract.toString() !== account.toString(), MitumError.detail(ECODE.INVALID_FACT, "contract is same with whitelist address")));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            Buffer.from(this.option),
            this.policy.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            option: this.option,
            ...this.policy.toHintedObject(),
            _hint: new Hint(HINT.DAO.REGISTER_MODEL.FACT).toString()
        };
    }
    get operationHint() {
        return HINT.DAO.REGISTER_MODEL.OPERATION;
    }
};

class DAOFact extends ContractFact {
    constructor(hint, token, sender, contract, proposalID, currency) {
        super(hint, token, sender, contract, currency);
        new URIString(proposalID, 'proposalID');
        this.proposalID = proposalID;
        Assert.check(this.proposalID !== "", MitumError.detail(ECODE.INVALID_FACT, "empty proposal id"));
        // this._hash = this.hashing()
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            Buffer.from(this.proposalID),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            proposal_id: this.proposalID,
        };
    }
}

class ProposeFact extends DAOFact {
    constructor(token, sender, contract, proposalID, proposal, currency) {
        super(HINT.DAO.PROPOSE.FACT, token, sender, contract, proposalID, currency);
        this.proposal = proposal;
        Assert.check(proposal.proposer.toString() === sender, MitumError.detail(ECODE.DAO.UNMATCHED_SENDER, `sender is unmatched with proposer of given proposal`));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.proposal.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            proposal: this.proposal.toHintedObject(),
        };
    }
    get operationHint() {
        return HINT.DAO.PROPOSE.OPERATION;
    }
}

class CancelProposalFact extends DAOFact {
    constructor(token, sender, contract, proposalID, currency) {
        super(HINT.DAO.CANCEL_PROPOSAL.FACT, token, sender, contract, proposalID, currency);
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    get operationHint() {
        return HINT.DAO.CANCEL_PROPOSAL.OPERATION;
    }
}

class RegisterFact extends DAOFact {
    constructor(token, sender, contract, proposalID, approved, currency) {
        super(HINT.DAO.REGISTER.FACT, token, sender, contract, proposalID, currency);
        this.approved = Address.from(approved);
        Assert.check(this.contract.toString() !== this.approved.toString(), MitumError.detail(ECODE.INVALID_FACT, "contract is same with approved address"));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.approved.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            approved: this.approved.toString(),
        };
    }
    get operationHint() {
        return HINT.DAO.REGISTER.OPERATION;
    }
}

class PreSnapFact extends DAOFact {
    constructor(token, sender, contract, proposalID, currency) {
        super(HINT.DAO.PRE_SNAP.FACT, token, sender, contract, proposalID, currency);
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    get operationHint() {
        return HINT.DAO.PRE_SNAP.OPERATION;
    }
}

class PostSnapFact extends DAOFact {
    constructor(token, sender, contract, proposalID, currency) {
        super(HINT.DAO.POST_SNAP.FACT, token, sender, contract, proposalID, currency);
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    get operationHint() {
        return HINT.DAO.POST_SNAP.OPERATION;
    }
}

class VoteFact extends DAOFact {
    constructor(token, sender, contract, proposalID, vote, currency) {
        super(HINT.DAO.VOTE.FACT, token, sender, contract, proposalID, currency);
        Assert.check(Config.DAO.VOTE.satisfy(Number(vote)), MitumError.detail(ECODE.INVALID_FACT, "vote option out of range"));
        this.vote = Big.from(vote);
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.vote.v === 0 ? Buffer.from([0x00]) : this.vote.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            vote_option: this.vote.v,
        };
    }
    get operationHint() {
        return HINT.DAO.VOTE.OPERATION;
    }
}

class ExecuteFact extends DAOFact {
    constructor(token, sender, contract, proposalID, currency) {
        super(HINT.DAO.EXECUTE.FACT, token, sender, contract, proposalID, currency);
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    get operationHint() {
        return HINT.DAO.EXECUTE.OPERATION;
    }
}

class DAOPolicy {
    constructor(votingPowerToken, threshold, proposalFee, proposerWhitelist, proposalReviewPeriod, registrationPeriod, preSnapshotPeriod, votingPeriod, postSnapshotPeriod, executionDelayPeriod, turnout, quorum) {
        this.hint = new Hint(HINT.DAO.POLICY);
        this.votingPowerToken = CurrencyID.from(votingPowerToken);
        this.threshold = Big.from(threshold);
        this.proposalFee = proposalFee,
            this.proposerWhitelist = proposerWhitelist;
        this.proposalReviewPeriod = Big.from(proposalReviewPeriod);
        this.registrationPeriod = Big.from(registrationPeriod);
        this.preSnapshotPeriod = Big.from(preSnapshotPeriod);
        this.votingPeriod = Big.from(votingPeriod);
        this.postSnapshotPeriod = Big.from(postSnapshotPeriod);
        this.executionDelayPeriod = Big.from(executionDelayPeriod);
        this.turnout = Big.from(turnout);
        this.quorum = Big.from(quorum);
        Assert.check(0 < this.proposalReviewPeriod.big && 0 < this.registrationPeriod.big && 0 < this.preSnapshotPeriod.big
            && 0 < this.votingPeriod.big && 0 < this.postSnapshotPeriod.big && 0 < this.executionDelayPeriod.big, MitumError.detail(ECODE.DAO.INVALID_POLICY, "period must not be set to 0 or below"));
        Assert.check(0 < this.threshold.big, MitumError.detail(ECODE.DAO.INVALID_POLICY, "threhold must be over zero"));
        Assert.check(Config.DAO.QUORUM.satisfy(this.turnout.v), MitumError.detail(ECODE.DAO.INVALID_POLICY, "turnout out of range"));
        Assert.check(Config.DAO.QUORUM.satisfy(this.quorum.v), MitumError.detail(ECODE.DAO.INVALID_POLICY, "quorum out of range"));
    }
    toBuffer() {
        return Buffer.concat([
            this.votingPowerToken.toBuffer(),
            this.threshold.toBuffer(),
            this.proposalFee.toBuffer(),
            this.proposerWhitelist.toBuffer(),
            this.proposalReviewPeriod.toBuffer("fill"),
            this.registrationPeriod.toBuffer("fill"),
            this.preSnapshotPeriod.toBuffer("fill"),
            this.votingPeriod.toBuffer("fill"),
            this.postSnapshotPeriod.toBuffer("fill"),
            this.executionDelayPeriod.toBuffer("fill"),
            this.turnout.toBuffer(),
            this.quorum.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            _hint: this.hint.toString(),
            voting_power_token: this.votingPowerToken.toString(),
            threshold: this.threshold.toString(),
            proposal_fee: this.proposalFee.toHintedObject(),
            proposer_whitelist: this.proposerWhitelist.toHintedObject(),
            proposal_review_period: this.proposalReviewPeriod.v,
            registration_period: this.registrationPeriod.v,
            pre_snapshot_period: this.preSnapshotPeriod.v,
            voting_period: this.votingPeriod.v,
            post_snapshot_period: this.postSnapshotPeriod.v,
            execution_delay_period: this.executionDelayPeriod.v,
            turnout: this.turnout.v,
            quorum: this.quorum.v,
        };
    }
}

class Whitelist {
    constructor(active, accounts) {
        this.hint = new Hint(HINT.DAO.WHITELIST);
        this.active = Bool.from(active);
        this.accounts = accounts ? accounts.map(a => Address.from(a)) : [];
        ArrayAssert.check(accounts, "whitelist").rangeLength(Config.DAO.ADDRESS_IN_WHITELIST).noDuplicates();
    }
    toBuffer() {
        return Buffer.concat([
            this.active.toBuffer(),
            Buffer.concat(this.accounts.sort(SortFunc).map(a => a.toBuffer())),
        ]);
    }
    toHintedObject() {
        return {
            _hint: this.hint.toString(),
            active: this.active.v,
            accounts: this.accounts.sort(SortFunc).map(a => a.toString()),
        };
    }
}

class Calldata {
    constructor(hint) {
        this.hint = new Hint(hint);
    }
    toBuffer() {
        return Buffer.from([]);
    }
    toHintedObject() {
        return {
            _hint: this.hint.toString(),
        };
    }
}
class TransferCalldata extends Calldata {
    constructor(sender, receiver, amount) {
        super(HINT.DAO.CALLDATA.TRANSFER);
        this.sender = Address.from(sender);
        this.receiver = Address.from(receiver);
        this.amount = amount;
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.sender.toBuffer(),
            this.receiver.toBuffer(),
            this.amount.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            sender: this.sender.toString(),
            receiver: this.receiver.toString(),
            amount: this.amount.toHintedObject(),
        };
    }
}
class GovernanceCalldata extends Calldata {
    constructor(policy) {
        super(HINT.DAO.CALLDATA.GOVERNANCE);
        this.policy = policy;
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.policy.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            policy: this.policy.toHintedObject(),
        };
    }
}
class Proposal {
    constructor(hint, proposer, startTime) {
        this.hint = new Hint(hint);
        this.proposer = Address.from(proposer);
        this.startTime = Big.from(startTime);
    }
    toBuffer() {
        return Buffer.concat([
            this.proposer.toBuffer(),
            this.startTime.toBuffer("fill"),
        ]);
    }
    toHintedObject() {
        return {
            _hint: this.hint.toString(),
            proposer: this.proposer.toString(),
            start_time: this.startTime.v,
        };
    }
}
class CryptoProposal extends Proposal {
    constructor(proposer, startTime, calldata) {
        super(HINT.DAO.PROPOSAL.CRYPTO, proposer, startTime);
        this.calldata = calldata;
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.calldata.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            call_data: this.calldata.toHintedObject(),
        };
    }
}
class BizProposal extends Proposal {
    constructor(proposer, startTime, url, hash, options) {
        super(HINT.DAO.PROPOSAL.BIZ, proposer, startTime);
        this.url = LongString.from(url);
        this.hash = LongString.from(hash);
        this.options = Big.from(options);
        Assert.check(Config.DAO.VOTE.satisfy(Number(this.options)), MitumError.detail(ECODE.INVALID_FACT, "vote option out of range"));
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.url.toBuffer(),
            this.hash.toBuffer(),
            this.options.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            url: this.url.toString(),
            hash: this.hash.toString(),
            options: this.options.v,
        };
    }
}

class UpdateModelConfigFact extends ContractFact {
    constructor(token, sender, contract, option, policy, currency) {
        super(HINT.DAO.UPDATE_MODEL_CONFIG.FACT, token, sender, contract, currency);
        this.option = option;
        this.policy = policy;
        this.policy.proposerWhitelist.accounts.forEach(account => Assert.check(this.contract.toString() !== account.toString(), MitumError.detail(ECODE.INVALID_FACT, "contract is same with whitelist address")));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            Buffer.from(this.option),
            this.policy.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            option: this.option,
            ...this.policy.toHintedObject(),
            _hint: new Hint(HINT.DAO.UPDATE_MODEL_CONFIG.FACT).toString()
        };
    }
    get operationHint() {
        return HINT.DAO.UPDATE_MODEL_CONFIG.OPERATION;
    }
}

class DAO extends ContractGenerator {
    constructor(networkID, api, delegateIP) {
        super(networkID, api, delegateIP);
    }
    /**
     * Generate `register-model` operation to register a new DAO model on the contract.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {daoData} [data] - Data for policy of DAO service to create. The properties of `daoData` include:
     * - {'crypto' | 'biz'} `option` - Option indicates the type of proposal to be registered.
     * - {string | CurrencyID} `votingPowerToken` - The currency ID to be used when calculating voting power.
     * - {string | number | Big} `threshold` - The minimum balance of a proposer must hold after paying for the proposal fee.
     * - {string | number | Big} `proposalFee` - The fee paid when registering a proposal.
     * - {(string | Address)[]} `proposerWhitelist` - An array of addresses for accounts who can propose the new proposals.
     * - {string | number | Big} `proposalReviewPeriod` - The duration of the proposal review period (in seconds).
     * - {string | number | Big} `registrationPeriod` - The duration of the registration period (in seconds).
     * - {string | number | Big} `preSnapshotPeriod` - The duration of the pre-snapshot period (in seconds).
     * - {string | number | Big} `votingPeriod` - The duration of the voting period (in seconds).
     * - {string | number | Big} `postSnapshotPeriod` - The duration of the post-snapshot period (in seconds).
     * - {string | number | Big} `executionDelayPeriod` - The duration of the execution delay period (in seconds).
     * - {string | number | Big} `turnout` - The minimum rate of attendees for a proposal to pass (in percentage)
     * - {string | number | Big} `quorum` - The minimum rate of upvotes for a proposal to pass (in percentage)
     * @param {string | CurrencyID} currency - The currency ID.
     * @returns `register-model` operation.
     */
    registerModel(contract, sender, data, currency) {
        const keysToCheck = ['option', 'votingPowerToken', 'threshold', 'proposalFee', 'proposerWhitelist', 'proposalReviewPeriod', 'registrationPeriod', 'preSnapshotPeriod', 'votingPeriod', 'postSnapshotPeriod', 'executionDelayPeriod', 'turnout', 'quorum'];
        keysToCheck.forEach((key) => {
            Assert.check(data[key] !== undefined, MitumError.detail(ECODE.INVALID_DATA_STRUCTURE, `${key} is undefined, check the daoData structure`));
        });
        return new Operation$1(this.networkID, new RegisterModelFact$5(TimeStamp$1.new().UTC(), sender, contract, data.option, new DAOPolicy(data.votingPowerToken, data.threshold, new Fee(currency, data.proposalFee), new Whitelist(true, data.proposerWhitelist.map(a => Address.from(a))), data.proposalReviewPeriod, data.registrationPeriod, data.preSnapshotPeriod, data.votingPeriod, data.postSnapshotPeriod, data.executionDelayPeriod, data.turnout, data.quorum), currency));
    }
    /**
     * Generate `update-model-config` operation for updating the DAO policy on the contract.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {daoData} [data] - Data for policy of DAO service to update. The properties of `daoData` include:
     * - {'crypto' | 'biz'} `option` - Option indicates the type of proposal to be registered.
     * - {string | CurrencyID} `votingPowerToken` - The currency ID to be used when calculating voting power.
     * - {string | number | Big} `threshold` - The minimum balance of a proposer must hold after paying for the proposal fee.
     * - {string | number | Big} `proposalFee` - The fee paid when registering a proposal.
     * - {(string | Address)[]} `proposerWhitelist` - An array of addresses for accounts who can propose the new proposals.
     * - {string | number | Big} `proposalReviewPeriod` - The duration of the proposal review period (in seconds).
     * - {string | number | Big} `registrationPeriod` - The duration of the registration period (in seconds).
     * - {string | number | Big} `preSnapshotPeriod` - The duration of the pre-snapshot period (in seconds).
     * - {string | number | Big} `votingPeriod` - The duration of the voting period (in seconds).
     * - {string | number | Big} `postSnapshotPeriod` - The duration of the post-snapshot period (in seconds).
     * - {string | number | Big} `executionDelayPeriod` - The duration of the execution delay period (in seconds).
     * - {string | number | Big} `turnout` - The minimum rate of attendees for a proposal to pass (in percentage)
     * - {string | number | Big} `quorum` - The minimum rate of upvotes for a proposal to pass (in percentage)
     * @param {string | CurrencyID} currency - The currency ID.
     * @returns `update-model-config` operation
     */
    updateModelConfig(contract, sender, data, currency) {
        const keysToCheck = ['option', 'votingPowerToken', 'threshold', 'proposalFee', 'proposerWhitelist', 'proposalReviewPeriod', 'registrationPeriod', 'preSnapshotPeriod', 'votingPeriod', 'postSnapshotPeriod', 'executionDelayPeriod', 'turnout', 'quorum'];
        keysToCheck.forEach((key) => {
            Assert.check(data[key] !== undefined, MitumError.detail(ECODE.INVALID_DATA_STRUCTURE, `${key} is undefined, check the daoData structure`));
        });
        return new Operation$1(this.networkID, new UpdateModelConfigFact(TimeStamp$1.new().UTC(), sender, contract, data.option, new DAOPolicy(data.votingPowerToken, data.threshold, new Fee(currency, data.proposalFee), new Whitelist(true, data.proposerWhitelist.map(a => Address.from(a))), data.proposalReviewPeriod, data.registrationPeriod, data.preSnapshotPeriod, data.votingPeriod, data.postSnapshotPeriod, data.executionDelayPeriod, data.turnout, data.quorum), currency));
    }
    /**
     * Create transfer calldata for the crypto proposal to transfer crypto currency.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | number | Big} [amount] - The amount to transfer.
     * @returns Transfer calldata.
     */
    formTransferCalldata(sender, receiver, currency, amount) {
        return new TransferCalldata(sender, receiver, new Amount(currency, amount));
    }
    /**
     * Create governance calldata for the crypto proposal to update DAO policy.
     * @param {policyData} [data] - Data for policy of DAO service to update. The properties of `policyData` include:
     * - {string | CurrencyID} `votingPowerToken` - The currency ID to be used when calculating voting power.
     * - {string | number | Big} `threshold` - The minimum balance of a proposer must hold after paying for the proposal fee.
     * - {string | number | Big} `proposalFee` - The fee paid when registering a proposal.
     * - {(string | Address)[]} `proposerWhitelist` - An array of addresses for accounts who can propose the new proposals.
     * - {string | number | Big} `proposalReviewPeriod` - The duration of the proposal review period (in seconds).
     * - {string | number | Big} `registrationPeriod` - The duration of the registration period (in seconds).
     * - {string | number | Big} `preSnapshotPeriod` - The duration of the pre-snapshot period (in seconds).
     * - {string | number | Big} `votingPeriod` - The duration of the voting period (in seconds).
     * - {string | number | Big} `postSnapshotPeriod` - The duration of the post-snapshot period (in seconds).
     * - {string | number | Big} `executionDelayPeriod` - The duration of the execution delay period (in seconds).
     * - {string | number | Big} `turnout` - The minimum rate of attendees for a proposal to pass (in percentage)
     * - {string | number | Big} `quorum` - The minimum rate of upvotes for a proposal to pass (in percentage)
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns governance calldata.
     */
    formSetPolicyCalldata(data, currency) {
        const keysToCheck = ['votingPowerToken', 'threshold', 'proposalFee', 'proposerWhitelist', 'proposalReviewPeriod', 'registrationPeriod', 'preSnapshotPeriod', 'votingPeriod', 'postSnapshotPeriod', 'executionDelayPeriod', 'turnout', 'quorum'];
        keysToCheck.forEach((key) => {
            Assert.check(data[key] !== undefined, MitumError.detail(ECODE.INVALID_DATA_STRUCTURE, `${key} is undefined, check the policyData structure`));
        });
        return new GovernanceCalldata(new DAOPolicy(data.votingPowerToken, data.threshold, new Fee(currency, data.proposalFee), new Whitelist(true, data.proposerWhitelist.map(a => Address.from(a))), data.proposalReviewPeriod, data.registrationPeriod, data.preSnapshotPeriod, data.votingPeriod, data.postSnapshotPeriod, data.executionDelayPeriod, data.turnout, data.quorum));
    }
    /**
     * Write a crypto proposal include `TransferCalldata` or `GovernanceCalldata` .
     * @param {string} [proposer] - The address of the proposer.
     * @param {number} [startTime] - The time to start `proposalReviewPeriod` (in UTC timestamp).
     * @param {TransferCalldata | GovernanceCalldata} [calldata] - Calldata for the crypto proposal.
     * @returns Crypto proposal to be proposed.
     */
    writeCryptoProposal(proposer, startTime, calldata) {
        return new CryptoProposal(proposer, startTime, calldata);
    }
    /**
     * Write a business proposal providing multiple choice voting.
     * @param {string | Address} [proposer] - The address of the proposer.
     * @param {string | number | Big} [startTime] - The time to start `proposalReviewPeriod` (in UTC timestamp).
     * @param {string | LongString} [url] - The URL associated with the proposal.
     * @param {string | LongString} [hash] - The hash associated with the proposal.
     * @param {string | number | Big} [options] - The number of multiple choices.
     * @returns Business proposal to be proposed.
     */
    writeBizProposal(proposer, startTime, url, hash, options) {
        return new BizProposal(proposer, startTime, url, hash, options);
    }
    /**
     * Generate `propose` operation for propose a new proposal. Only the account in the whitelist can propose.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [proposalID] - The unique identifier for the proposal.
     * @param {CryptoProposal | BizProposal} [proposal] - The proposal written by `writeBizProposal` or `writeCryptoProposal`.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `propose` operation.
     */
    propose(contract, sender, proposalID, proposal, currency) {
        return new Operation$1(this.networkID, new ProposeFact(TimeStamp$1.new().UTC(), sender, contract, proposalID, proposal, currency));
    }
    /**
     * Generate `register` operation to register to get voting right to the proposal. If approved is given, delegate voting rights to the account.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [proposalID] - The proposal ID.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | Address} [approved] - (Optional) The address of the account to which voting rights will be delegated..
     * @returns `register` operation
     */
    register(contract, sender, proposalID, currency, approved) {
        return new Operation$1(this.networkID, new RegisterFact(TimeStamp$1.new().UTC(), sender, contract, proposalID, approved ? approved : sender, currency));
    }
    /**
     * Generate `cancel-proposal` operation to cancel a DAO proposal.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [proposalID] - The unique identifier for the proposal.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `cancel-proposal` operation
     */
    cancelProposal(contract, sender, proposalID, currency) {
        return new Operation$1(this.networkID, new CancelProposalFact(TimeStamp$1.new().UTC(), sender, contract, proposalID, currency));
    }
    /**
     * Generate `pre-snap` operation to take a snapshot before the voting period.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [proposalID] - The proposal ID.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `pre-snap` operation.
     */
    preSnap(contract, sender, proposalID, currency) {
        return new Operation$1(this.networkID, new PreSnapFact(TimeStamp$1.new().UTC(), sender, contract, proposalID, currency));
    }
    /**
     * Generate `vote` operation to cast a vote for the proposal.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [proposalID] - The proposal ID.
     * @param {number} [voteOption] - The option chosen for the vote. (crypto: 0-approve, 1-disapprove, biz: choose from multiple choices)
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `vote` operation.
     */
    vote(contract, sender, proposalID, voteOption, currency) {
        return new Operation$1(this.networkID, new VoteFact(TimeStamp$1.new().UTC(), sender, contract, proposalID, voteOption, currency));
    }
    /**
     * Generate `post-snap` operation to take a snapshot after the voting period.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [proposalID] - The proposal ID.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `post-snap` operation
     */
    postSnap(contract, sender, proposalID, currency) {
        return new Operation$1(this.networkID, new PostSnapFact(TimeStamp$1.new().UTC(), sender, contract, proposalID, currency));
    }
    /**
     * Generate `execute` operation to reflect voting results.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [proposalID] - The proposal ID.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `execute` operation
     */
    execute(contract, sender, proposalID, currency) {
        return new Operation$1(this.networkID, new ExecuteFact(TimeStamp$1.new().UTC(), sender, contract, proposalID, currency));
    }
    /**
     * Get DAO model information for a specific contract address.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @returns `data` of `SuccessResponse` is information of the DAO service:
     * - `_hint`: Hint for dao design,
     * - `option`: 'biz' or 'crypto',
     * - `policy`: [Policy]
     */
    async getModelInfo(contract) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        return await getAPIData(() => contractApi.dao.getModel(this.api, contract, this.delegateIP));
    }
    /**
     * Get information about a specific DAO proposal. The `status` does not accurately reflect the current state of the proposal because it is updated only when an operation occurs.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string} [proposalID] - The proposal ID.
     * @returns `data` of `SuccessResponse` is information about the DAO proposal:
     * - `_hint`: Hint for the dao proposal state value,
     * - `reason`: Indicates the reason if the propose was canceled before voting,
     * - `status`: Proposal status - Proposed (0), Canceled (1), PreSnapped (2), PostSnapped (3), Completed (4), Rejected (5), Executed (6), NilStatus (7),
     * - `proposal`: [BizProposal] or [CryptoProposal],
     * - `policy`: [Policy]
     */
    async getProposal(contract, proposalID) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        new URIString(proposalID, 'proposalID');
        return await getAPIData(() => contractApi.dao.getProposal(this.api, contract, proposalID, this.delegateIP));
    }
    /**
     * Get the approved account who has taken over the voting rights from the registrant account.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string} [proposalID] - The proposal ID.
     * @param {string | Address} [account] - The address of the account that has approved another account.
     * @returns `data` of `SuccessResponse` is approval information:
     * - `_hint`: Hint for DAO approval voting info,
     * - `account`: Address of the registrant that has approved another account,
     * - `approved`: Address of the approved account,
     */
    async getApproved(contract, proposalID, account) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        new URIString(proposalID, 'proposalID');
        return await getAPIData(() => contractApi.dao.getApproved(this.api, contract, proposalID, account, this.delegateIP));
    }
    /**
     * Get information about voters in a specific DAO proposal.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string} [proposalID] - The proposal ID.
     * @returns `data` of `SuccessResponse` is an array of information of the voters:
     * - `_hint`: Hint for dao voter,
     * - `voter`: Address of account that can vote,
     * - `votring_power_holders`: List of accounts that have delegated their voting power to voter.
     */
    async getVoters(contract, proposalID) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        new URIString(proposalID, 'proposalID');
        return await getAPIData(() => contractApi.dao.getVoters(this.api, contract, proposalID, this.delegateIP));
    }
    /**
     * Get the status of the voting for the proposal.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string} [proposalID] - The proposal ID.
     * @returns `data` of `SuccessResponse` is information of voting power and the voting result:
     * - `_hint`: Hint for voting power box.
     * - `total`: Total voting power.
     * - `voting_powers`: Object mapping registered account addresses to their corresponding voting information represents `_hint`, `account`,`voted`, `vote_for`, `voting_power`.
     * - `result`: Object consisting of the selected option and the number of votes.
     */
    async getVotingStatus(contract, proposalID) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        new URIString(proposalID, 'proposalID');
        return await getAPIData(() => contractApi.dao.getVotingStatus(this.api, contract, proposalID, this.delegateIP));
    }
}

class STOItem extends Item {
    constructor(hint, contract, currency) {
        super(hint);
        this.contract = Address.from(contract);
        this.currency = CurrencyID.from(currency);
    }
    toBuffer() {
        return this.contract.toBuffer();
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            contract: this.contract.toString(),
            currency: this.currency.toString(),
        };
    }
    toString() {
        return this.contract.toString();
    }
}

class Partition {
    constructor(s) {
        Assert.check(Config.STO.PARTITION.satisfy(s.length), MitumError.detail(ECODE.STO.INVALID_PARTITION, "partition length out of range"));
        Assert.check(/^[A-Z0-9][A-Z0-9_\.\!\$\*\@]*[A-Z0-9]$/.test(s), MitumError.detail(ECODE.STO.INVALID_PARTITION, "invalid partition format"));
        this.s = s;
    }
    static from(s) {
        return s instanceof Partition ? s : new Partition(s);
    }
    toBuffer() {
        return Buffer.from(this.s);
    }
    toString() {
        return this.s;
    }
}

class CreateSecurityTokenItem extends STOItem {
    constructor(contract, granularity, defaultPartition, currency) {
        super(HINT.STO.CREATE_SECURITY_TOKEN.ITEM, contract, currency);
        this.granularity = Big.from(granularity);
        this.defaultPartition = Partition.from(defaultPartition);
        Assert.check(this.granularity.overZero(), MitumError.detail(ECODE.INVALID_ITEM, "granularity must be over zero"));
    }
    toBuffer() {
        return Buffer.concat([
            this.contract.toBuffer(),
            this.granularity.toBuffer("fill"),
            this.defaultPartition.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            granularity: this.granularity.v,
            default_partition: this.defaultPartition.toString(),
        };
    }
    toString() {
        return `${super.toString()}-${this.defaultPartition.toString()}`;
    }
}
class CreateSecurityTokenFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.STO.CREATE_SECURITY_TOKEN.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate contract found in items"));
        items.forEach(item => {
            Assert.check(item.contract.toString() !== sender.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
        });
    }
    get operationHint() {
        return HINT.STO.CREATE_SECURITY_TOKEN.OPERATION;
    }
}

class IssueItem extends STOItem {
    constructor(contract, receiver, amount, partition, currency) {
        super(HINT.STO.ISSUE.ITEM, contract, currency);
        this.receiver = Address.from(receiver);
        this.amount = Big.from(amount);
        this.partition = Partition.from(partition);
        Assert.check(this.contract.toString() !== this.receiver.toString(), MitumError.detail(ECODE.INVALID_ITEM, "receiver is same with contract address"));
        Assert.check(this.amount.overZero(), MitumError.detail(ECODE.INVALID_ITEM, "amount must be over zero"));
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.receiver.toBuffer(),
            this.amount.toBuffer(),
            this.partition.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            receiver: this.receiver.toString(),
            amount: this.amount.toString(),
            partition: this.partition.toString(),
        };
    }
    toString() {
        return `${super.toString()}-${this.receiver.toString()}-${this.partition.toString()}`;
    }
}
let IssueFact$1 = class IssueFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.STO.ISSUE.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate contract found in items"));
        items.forEach(item => {
            Assert.check(item.contract.toString() !== sender.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
        });
    }
    get operationHint() {
        return HINT.STO.ISSUE.OPERATION;
    }
};

class AuthorizeOperatorItem extends STOItem {
    constructor(contract, operator, partition, currency) {
        super(HINT.STO.AUTHORIZE_OPERATOR.ITEM, contract, currency);
        this.operator = Address.from(operator);
        this.partition = Partition.from(partition);
        Assert.check(this.contract.toString() !== this.operator.toString(), MitumError.detail(ECODE.INVALID_ITEM, "operator is same with contract address"));
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.operator.toBuffer(),
            this.partition.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            operator: this.operator.toString(),
            partition: this.partition.toString(),
        };
    }
    toString() {
        return `${super.toString()}-${this.operator.toString()}-${this.partition.toString()}`;
    }
}
class AuthorizeOperatorFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.STO.AUTHORIZE_OPERATOR.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate operator found in items"));
        items.forEach(item => {
            Assert.check(item.contract.toString() !== sender.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
            Assert.check(item.operator.toString() !== sender.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "operator is same with sender address"));
        });
    }
    get operationHint() {
        return HINT.STO.AUTHORIZE_OPERATOR.OPERATION;
    }
}

class RevokeOperatorItem extends STOItem {
    constructor(contract, operator, partition, currency) {
        super(HINT.STO.REVOKE_OPERATOR.ITEM, contract, currency);
        this.operator = Address.from(operator);
        this.partition = Partition.from(partition);
        Assert.check(this.contract.toString() !== this.operator.toString(), MitumError.detail(ECODE.INVALID_ITEM, "operator is same with contract address"));
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.operator.toBuffer(),
            this.partition.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            operator: this.operator.toString(),
            partition: this.partition.toString(),
        };
    }
    toString() {
        return `${super.toString()}-${this.operator.toString()}-${this.partition.toString()}`;
    }
}
class RevokeOperatorFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.STO.REVOKE_OPERATOR.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate operator found in items"));
        items.forEach(item => {
            Assert.check(item.contract.toString() !== sender.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
        });
    }
    get operationHint() {
        return HINT.STO.REVOKE_OPERATOR.OPERATION;
    }
}

class RedeemItem extends STOItem {
    constructor(contract, tokenHolder, amount, partition, currency) {
        super(HINT.STO.REDEEM.ITEM, contract, currency);
        this.tokenHolder = Address.from(tokenHolder);
        this.amount = Big.from(amount);
        this.partition = Partition.from(partition);
        Assert.check(this.contract.toString() !== this.tokenHolder.toString(), MitumError.detail(ECODE.INVALID_ITEM, "tokenHolder is same with contract address"));
        Assert.check(this.amount.overZero(), MitumError.detail(ECODE.INVALID_ITEM, "amount must be over zero"));
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.tokenHolder.toBuffer(),
            this.amount.toBuffer(),
            this.partition.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            tokenHolder: this.tokenHolder.toString(),
            amount: this.amount.toString(),
            partition: this.partition.toString(),
        };
    }
    toString() {
        return `${super.toString()}-${this.tokenHolder.toString()}-${this.partition.toString()}`;
    }
}
class RedeemFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.STO.REDEEM.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate token holder found in items"));
        items.forEach(item => {
            Assert.check(item.contract.toString() !== sender.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
        });
    }
    get operationHint() {
        return HINT.STO.REDEEM.OPERATION;
    }
}

class SetDocumentFact extends ContractFact {
    constructor(token, sender, contract, title, uri, documentHash, currency) {
        super(HINT.STO.SET_DOCUMENT.FACT, token, sender, contract, currency);
        this.title = title;
        this.uri = uri;
        this.documentHash = documentHash;
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            Buffer.from(this.title),
            Buffer.from(this.uri),
            Buffer.from(this.documentHash),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            title: this.title,
            uri: this.uri,
            documenthash: this.documentHash,
        };
    }
    get operationHint() {
        return HINT.STO.SET_DOCUMENT.OPERATION;
    }
}

class TransferByPartitionItem extends STOItem {
    constructor(contract, tokenHolder, receiver, partition, amount, currency) {
        super(HINT.STO.TRANSFER_BY_PARTITION.ITEM, contract, currency);
        this.tokenHolder = Address.from(tokenHolder);
        this.receiver = Address.from(receiver);
        this.partition = Partition.from(partition);
        this.amount = Big.from(amount);
        Assert.check(this.contract.toString() !== this.tokenHolder.toString(), MitumError.detail(ECODE.INVALID_ITEM, "tokenHolder is same with contract address"));
        Assert.check(this.contract.toString() !== this.receiver.toString(), MitumError.detail(ECODE.INVALID_ITEM, "receiver is same with contract address"));
        Assert.check(this.tokenHolder.toString() !== this.receiver.toString(), MitumError.detail(ECODE.INVALID_ITEM, "tokenHolder is same with receiver address"));
        Assert.check(this.amount.overZero(), MitumError.detail(ECODE.INVALID_ITEM, "amount must be over zero"));
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.tokenHolder.toBuffer(),
            this.receiver.toBuffer(),
            this.partition.toBuffer(),
            this.amount.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            tokenholder: this.tokenHolder.toString(),
            receiver: this.receiver.toString(),
            partition: this.partition.toString(),
            amount: this.amount.toString(),
        };
    }
    toString() {
        return `${super.toString()}-${this.tokenHolder.toString()}-${this.receiver.toString()}-${this.partition.toString()}`;
    }
}
class TransferByPartitionFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.STO.TRANSFER_BY_PARTITION.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate token holder-receiver-partition found in items"));
        items.forEach(item => {
            Assert.check(item.contract.toString() !== sender.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
        });
    }
    get operationHint() {
        return HINT.STO.TRANSFER_BY_PARTITION.OPERATION;
    }
}

class STO extends ContractGenerator {
    constructor(networkID, api, delegateIP) {
        super(networkID, api, delegateIP);
    }
    /**
     * Generate `authorize-operator` operation to authorize an operator for the security token in specific partition.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [operator] - The operator's address to be authorized.
     * @param {string | Partition} [partition] - The partition ID.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `authorize-operator` operation.
     */
    authorizeOperator(contract, sender, operator, partition, currency) {
        return new Operation$1(this.networkID, new AuthorizeOperatorFact(TimeStamp$1.new().UTC(), sender, [
            new AuthorizeOperatorItem(contract, operator, partition, currency)
        ]));
    }
    /**
     * Generate `create-security-token` operation to create new security token.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {createServiceData} [data] - Data required to create the security token. The properties of `createServiceData` include:
     * - {string | number | Big} `granularity` - The basic unit of the token.
     * - {string | Partition} `defaultPartition` - Capital letters with length between 3 and 10 (can include numbers)
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `create-security-token` operation
     */
    createService(contract, sender, data, currency) {
        const keysToCheck = ['granularity', 'defaultPartition'];
        keysToCheck.forEach((key) => {
            Assert.check(data[key] !== undefined, MitumError.detail(ECODE.INVALID_DATA_STRUCTURE, `${key} is undefined, check the createServiceData structure`));
        });
        return new Operation$1(this.networkID, new CreateSecurityTokenFact(TimeStamp$1.new().UTC(), sender, [
            new CreateSecurityTokenItem(contract, data.granularity, data.defaultPartition, currency)
        ]));
    }
    /**
     * Generate `issue` operation to issue new security token in specific partition to a specified receiver.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | Partition} [partition] - The partition ID.
     * @param {string | number | Big} [amount] - The amount of tokens to issue.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `issue` operation.
     */
    issue(contract, sender, receiver, partition, amount, currency) {
        return new Operation$1(this.networkID, new IssueFact$1(TimeStamp$1.new().UTC(), sender, [
            new IssueItem(contract, receiver, amount, partition, currency)
        ]));
    }
    /**
     * Generate `redeem` operation to redeem(burn) a specified amount of security token in a specific partition.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [tokenHolder] - The token holder's address.
     * @param {string | Partition} [partition] - The partition ID.
     * @param {string | number | Big} [amount] - The amount of tokens to redeem.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `redeem` operation.
     */
    redeem(contract, sender, tokenHolder, partition, amount, currency) {
        return new Operation$1(this.networkID, new RedeemFact(TimeStamp$1.new().UTC(), sender, [
            new RedeemItem(contract, tokenHolder, amount, partition, currency)
        ]));
    }
    /**
     * Generate `revoke` operation to revoke operator's authorization for the security token in specific partition.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [operator] - The operator's address.
     * @param {string | Partition} [partition] - The partition ID.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `revoke` operation.
     */
    revokeOperator(contract, sender, operator, partition, currency) {
        return new Operation$1(this.networkID, new RevokeOperatorFact(TimeStamp$1.new().UTC(), sender, [
            new RevokeOperatorItem(contract, operator, partition, currency)
        ]));
    }
    /**
     * Generate `setDocumnet` operation to set document for the security token on the contract.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [title] - The title of the document.
     * @param {string} [uri] - The URI of the document.
     * @param {string} [documentHash] - The hash value of the document.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `setDocumnet` operation.
     */
    setDocument(contract, sender, title, uri, documentHash, currency) {
        return new Operation$1(this.networkID, new SetDocumentFact(TimeStamp$1.new().UTC(), sender, contract, title, uri, documentHash, currency));
    }
    /**
     * Generate `transfer-by-partition` operation to transfer security token in specific partitions.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [holder] - The token holder's address.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | Partition} [partition] - The partition ID.
     * @param {string | number | Big} [amount] - The amount of tokens to transfer.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `transfer-by-partition` operation
     */
    transferByPartition(contract, sender, holder, receiver, partition, amount, currency) {
        return new Operation$1(this.networkID, new TransferByPartitionFact(TimeStamp$1.new().UTC(), sender, [
            new TransferByPartitionItem(contract, holder, receiver, partition, amount, currency)
        ]));
    }
    /**
     * Get information about the security token on the contract.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @returns `data` of `SuccessResponse` is information of the security token:
     * - `_hint`: Hint for STO design,
     * - `granularity`: Basic unit for the token,
     * - `policy`: {
     *     _hint: Hint for the STO policy,
     *     partitions: Array of name of partition,
     *     aggregate: Total supply amount,
     *     documents: Array of information about documents with `_hint`, `title`, `hash`, `uri`
     * }
     */
    async getServiceInfo(contract) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        return await getAPIData(() => contractApi.sto.getService(this.api, contract, this.delegateIP));
    }
    /**
     * Get partitions of given holder.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [holder] - The token holder's address.
     * @returns `data` of `SuccessResponse` is an array of token partition names owned by the holder.
     */
    async getPartitionsInfo(contract, holder) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        Address.from(holder);
        return await getAPIData(() => contractApi.sto.getPartitions(this.api, contract, holder, this.delegateIP));
    }
    /**
     * Get balance of holder for the partition.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [holder] - The token holder's address.
     * @param {string} [partition] - The partition ID.
     * @returns `data` of `SuccessResponse` is the balance of holder for the partition
     */
    async getBalanceByHolder(contract, holder, partition) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        Address.from(holder);
        return await getAPIData(() => contractApi.sto.getBalanceByHolder(this.api, contract, holder, partition, this.delegateIP));
    }
    /**
     * Get operators of the partition who granted by the holder.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [holder] - The token holder's address.
     * @param {string} [partition] - The partition ID.
     * @returns `data` of `SuccessResponse` is information of the operators:
     * - `operators`: Array of the address of operators.
     */
    async getOperatorsByHolder(contract, holder, partition) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        Address.from(holder);
        return await getAPIData(() => contractApi.sto.getOperatorsByHolder(this.api, contract, holder, partition, this.delegateIP));
    }
    /**
     * Get balance for a specific partition.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string} [partition] - The partition ID.
     * @returns `data` of `SuccessResponse` is the partition balance amount.
     */
    async getPartitionBalanceInfo(contract, partition) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        return await getAPIData(() => contractApi.sto.getPartitionBalance(this.api, contract, partition, this.delegateIP));
    }
    /**
     * Get information about the holder who granted to the operator.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [operator] - The operator's address.
     * @returns `data` of `SuccessResponse` is information of holder:
     * - `holders`: Array of the address of holders.
     */
    async getAuthorizedInfo(contract, operator) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        Address.from(operator);
        return await getAPIData(() => contractApi.sto.getAuthorized(this.api, contract, operator, this.delegateIP));
    }
}

class CreateServiceFact extends ContractFact {
    constructor(token, sender, contract, currency) {
        super(HINT.KYC.CREATE_SERVICE.FACT, token, sender, contract, currency);
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    get operationHint() {
        return HINT.KYC.CREATE_SERVICE.OPERATION;
    }
}

class KYCItem extends Item {
    constructor(hint, contract, currency) {
        super(hint);
        this.contract = Address.from(contract);
        this.currency = CurrencyID.from(currency);
    }
    toBuffer() {
        return this.contract.toBuffer();
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            contract: this.contract.toString(),
            currency: this.currency.toString(),
        };
    }
    toString() {
        return this.contract.toString();
    }
}

class AddControllerItem extends KYCItem {
    constructor(contract, controller, currency) {
        super(HINT.KYC.ADD_CONTROLLER.ITEM, contract, currency);
        this.controller = Address.from(controller);
        Assert.check(this.contract.toString() !== this.controller.toString(), MitumError.detail(ECODE.INVALID_ITEM, "contract is same with controller address"));
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.controller.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            controller: this.controller.toString(),
        };
    }
    toString() {
        return `${super.toString()}-${this.controller.toString()}`;
    }
}
class AddControllerFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.KYC.ADD_CONTROLLER.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate controller found in items"));
    }
    get operationHint() {
        return HINT.KYC.ADD_CONTROLLER.OPERATION;
    }
}

class RemoveControllerItem extends KYCItem {
    constructor(contract, controller, currency) {
        super(HINT.KYC.REMOVE_CONTROLLER.ITEM, contract, currency);
        this.controller = Address.from(controller);
        Assert.check(this.contract.toString() !== this.controller.toString(), MitumError.detail(ECODE.INVALID_ITEM, "contract is same with controller address"));
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.controller.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            controller: this.controller.toString(),
        };
    }
    toString() {
        return `${super.toString()}-${this.controller.toString()}`;
    }
}
class RemoveControllerFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.KYC.REMOVE_CONTROLLER.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate controller found in items"));
    }
    get operationHint() {
        return HINT.KYC.REMOVE_CONTROLLER.OPERATION;
    }
}

class AddCustomerItem extends KYCItem {
    constructor(contract, customer, status, currency) {
        super(HINT.KYC.ADD_CUSTOMER.ITEM, contract, currency);
        this.customer = Address.from(customer);
        this.status = Bool.from(status);
        Assert.check(this.contract.toString() !== this.customer.toString(), MitumError.detail(ECODE.INVALID_ITEM, "contract is same with customer address"));
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.customer.toBuffer(),
            this.status.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            customer: this.customer.toString(),
            status: this.status.v,
        };
    }
    toString() {
        return `${super.toString()}-${this.customer.toString()}`;
    }
}
class AddCustomerFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.KYC.ADD_CUSTOMER.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate customer found in items"));
    }
    get operationHint() {
        return HINT.KYC.ADD_CUSTOMER.OPERATION;
    }
}

class UpdateCustomerItem extends KYCItem {
    constructor(contract, customer, status, currency) {
        super(HINT.KYC.UPDATE_CUSTOMER.ITEM, contract, currency);
        this.customer = Address.from(customer);
        this.status = Bool.from(status);
        Assert.check(this.contract.toString() !== this.customer.toString(), MitumError.detail(ECODE.INVALID_ITEM, "contract is same with customer address"));
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.customer.toBuffer(),
            this.status.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            customer: this.customer.toString(),
            status: this.status.v,
        };
    }
    toString() {
        return `${super.toString()}-${this.customer.toString()}`;
    }
}
class UpdateCustomerFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.KYC.UPDATE_CUSTOMER.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicate customer found in items"));
    }
    get operationHint() {
        return HINT.KYC.UPDATE_CUSTOMER.OPERATION;
    }
}

class KYC extends ContractGenerator {
    constructor(networkID, api, delegateIP) {
        super(networkID, api, delegateIP);
    }
    createService(contract, sender, currency) {
        return new Operation$1(this.networkID, new CreateServiceFact(TimeStamp$1.new().UTC(), sender, contract, currency));
    }
    addController(contract, sender, controller, currency) {
        return new Operation$1(this.networkID, new AddControllerFact(TimeStamp$1.new().UTC(), sender, [
            new AddControllerItem(contract, controller, currency)
        ]));
    }
    addCustomer(contract, sender, customer, status, currency) {
        return new Operation$1(this.networkID, new AddCustomerFact(TimeStamp$1.new().UTC(), sender, [
            new AddCustomerItem(contract, customer, status, currency)
        ]));
    }
    removeController(contract, sender, controller, currency) {
        return new Operation$1(this.networkID, new RemoveControllerFact(TimeStamp$1.new().UTC(), sender, [
            new RemoveControllerItem(contract, controller, currency)
        ]));
    }
    updateCustomer(contract, sender, customer, status, currency) {
        return new Operation$1(this.networkID, new UpdateCustomerFact(TimeStamp$1.new().UTC(), sender, [new UpdateCustomerItem(contract, customer, status, currency)]));
    }
}

class TimeStampFact extends ContractFact {
    constructor(hint, token, sender, contract, currency) {
        super(hint, token, sender, contract, currency);
        // this._hash = this.hashing()
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
        };
    }
}

let RegisterModelFact$4 = class RegisterModelFact extends TimeStampFact {
    constructor(token, sender, contract, currency) {
        super(HINT.TIMESTAMP.REGISTER_MODEL.FACT, token, sender, contract, currency);
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
        ]);
    }
    get operationHint() {
        return HINT.TIMESTAMP.REGISTER_MODEL.OPERATION;
    }
};

class IssueFact extends ContractFact {
    constructor(token, sender, contract, projectID, requestTimeStamp, data, currency) {
        super(HINT.TIMESTAMP.ISSUE.FACT, token, sender, contract, currency);
        this.projectID = projectID;
        this.requestTimeStamp = Big.from(requestTimeStamp);
        this.data = data;
        Assert.check(Config.TIMESTAMP.PROJECT_ID.satisfy(this.projectID.length), MitumError.detail(ECODE.INVALID_FACT, "project id length out of range"));
        Assert.check(Config.TIMESTAMP.DATA.satisfy(this.data.length), MitumError.detail(ECODE.INVALID_FACT, "data length out of range"));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            Buffer.from(this.projectID),
            this.requestTimeStamp.toBuffer("fill"),
            Buffer.from(this.data),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            project_id: this.projectID,
            request_timestamp: this.requestTimeStamp.v,
            data: this.data,
        };
    }
    get operationHint() {
        return HINT.TIMESTAMP.ISSUE.OPERATION;
    }
}

class TimeStamp extends ContractGenerator {
    constructor(networkID, api, delegateIP) {
        super(networkID, api, delegateIP);
    }
    /**
     * Generate a `register-model` operation to register new timestamp model on the contract.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `register-model` operation.
     */
    registerModel(contract, sender, currency) {
        return new Operation$1(this.networkID, new RegisterModelFact$4(TimeStamp$1.new().UTC(), sender, contract, currency));
    }
    /**
     * Generate `issue` operation to issue new timestamp to the project on the timestamp model.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [projectID] - The ID of the project to issue.
     * @param {string | number | Big} [requestTimeStamp] - Value of the timestamp to record.
     * @param {string} [data] - The data to be appended.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `issue` operation
     */
    issue(contract, sender, projectID, requestTimeStamp, data, currency) {
        new URIString(projectID, 'projectID');
        const fact = new IssueFact(TimeStamp$1.new().UTC(), sender, contract, projectID, requestTimeStamp, data, currency);
        return new Operation$1(this.networkID, fact);
    }
    /**
     * Get information about a timestamp service on the contract.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @returns `data` of `SuccessResponse` is information about the timestamp service:
     * - `_hint`: Hint for timestamp design,
     * - `projects`: Array of all project's id
     */
    async getModelInfo(contract) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        return await getAPIData(() => contractApi.timestamp.getModel(this.api, contract, this.delegateIP));
    }
    /**
     * Get detailed information about a timestamp on the project.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string} [projectID] - The ID of the project.
     * @param {string | number | Big} [timestampIdx] - The index of timestamp (Indicate the order of appended to the project)
     * @returns `data` of `SuccessResponse` is information about the timestamp with certain tid on the certain project:
     * - `_hint`: Hint for timestamp item,
     * - `project_id`: ID of the timestamp project,
     * - `request_timestamp`: Request timestamp entered when appending timestamp,
     * - `response_timestamp`: Time when the timestamp was registered,
     * - `timestamp_idx`: A index for the timestamp ,
     * - `data`: Data string
     */
    async getTimestamp(contract, projectID, timestampIdx) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        new URIString(projectID, 'projectID');
        return await getAPIData(() => contractApi.timestamp.getTimeStamp(this.api, contract, projectID, timestampIdx, this.delegateIP));
    }
}

class TokenFact extends ContractFact {
    constructor(hint, token, sender, contract, currency) {
        super(hint, token, sender, contract, currency);
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
        };
    }
}

let RegisterModelFact$3 = class RegisterModelFact extends TokenFact {
    constructor(token, sender, contract, currency, symbol, name, decimal, initialSupply) {
        super(HINT.TOKEN.REGISTER_MODEL.FACT, token, sender, contract, currency);
        this.symbol = CurrencyID.from(symbol);
        this.name = LongString.from(name);
        this.decimal = Big.from(decimal);
        this.initialSupply = Big.from(initialSupply);
        Assert.check(this.initialSupply.compare(0) >= 0, MitumError.detail(ECODE.INVALID_FACT, "initialSupply under zero"));
        Assert.check(this.decimal.compare(0) >= 0, MitumError.detail(ECODE.INVALID_FACT, "decimal number under zero"));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.symbol.toBuffer(),
            this.name.toBuffer(),
            this.decimal.toBuffer(),
            this.initialSupply.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            symbol: this.symbol.toString(),
            name: this.name.toString(),
            decimal: this.decimal.toString(),
            initial_supply: this.initialSupply.toString(),
        };
    }
    get operationHint() {
        return HINT.TOKEN.REGISTER_MODEL.OPERATION;
    }
};

let MintFact$1 = class MintFact extends TokenFact {
    constructor(token, sender, contract, currency, receiver, amount) {
        super(HINT.TOKEN.MINT.FACT, token, sender, contract, currency);
        this.receiver = Address.from(receiver);
        this.amount = Big.from(amount);
        Assert.check(this.contract.toString() !== this.receiver.toString(), MitumError.detail(ECODE.INVALID_FACT, "receiver is same with contract address"));
        Assert.check(this.amount.overZero(), MitumError.detail(ECODE.INVALID_FACT, "amount must be over zero"));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.receiver.toBuffer(),
            this.amount.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            receiver: this.receiver.toString(),
            amount: this.amount.toString(),
        };
    }
    get operationHint() {
        return HINT.TOKEN.MINT.OPERATION;
    }
};

let BurnFact$1 = class BurnFact extends TokenFact {
    constructor(token, sender, contract, currency, amount) {
        super(HINT.TOKEN.BURN.FACT, token, sender, contract, currency);
        this.target = Address.from(sender);
        this.amount = Big.from(amount);
        // Assert.check(
        //     Address.from(contract).toString() !== this.target.toString(),
        //     MitumError.detail(ECODE.INVALID_FACT, "target is same with contract address")
        // )
        Assert.check(this.amount.overZero(), MitumError.detail(ECODE.INVALID_FACT, "amount must be over zero"));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.target.toBuffer(),
            this.amount.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            target: this.target.toString(),
            amount: this.amount.toString(),
        };
    }
    get operationHint() {
        return HINT.TOKEN.BURN.OPERATION;
    }
};

let TransferFact$2 = class TransferFact extends TokenFact {
    constructor(token, sender, contract, currency, receiver, amount) {
        super(HINT.TOKEN.TRANSFER.FACT, token, sender, contract, currency);
        this.receiver = Address.from(receiver);
        this.amount = Big.from(amount);
        Assert.check(this.contract.toString() !== this.receiver.toString(), MitumError.detail(ECODE.INVALID_FACT, "receiver is same with contract address"));
        Assert.check(this.receiver.toString() !== this.sender.toString(), MitumError.detail(ECODE.INVALID_FACT, "receiver is same with sender address"));
        Assert.check(this.amount.overZero(), MitumError.detail(ECODE.INVALID_FACT, "amount must be over zero"));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.receiver.toBuffer(),
            this.amount.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            receiver: this.receiver.toString(),
            amount: this.amount.toString(),
        };
    }
    get operationHint() {
        return HINT.TOKEN.TRANSFER.OPERATION;
    }
};

class TokenItem extends Item {
    constructor(hint, contract, amount, currency) {
        super(hint);
        this.contract = Address.from(contract);
        this.amount = Big.from(amount);
        this.currency = CurrencyID.from(currency);
    }
    toBuffer() {
        return this.contract.toBuffer();
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            contract: this.contract.toString(),
        };
    }
    toString() {
        return this.contract.toString();
    }
}

let TransfersItem$1 = class TransfersItem extends TokenItem {
    constructor(contract, receiver, amount, currency) {
        super(HINT.TOKEN.TRANSFERS.ITEM, contract, amount, currency);
        this.receiver = Address.from(receiver);
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.receiver.toBuffer(),
            this.amount.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            receiver: this.receiver.toString(),
            amount: this.amount.toString(),
            currency: this.currency.toString(),
        };
    }
    toString() {
        return `${super.toString()}-${this.receiver.toString()}`;
    }
};
let TransfersFact$1 = class TransfersFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.TOKEN.TRANSFERS.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicated receiver found in items"));
        this.items.forEach(it => {
            Assert.check(this.sender.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
            Assert.check(it.receiver.toString() !== this.sender.toString(), MitumError.detail(ECODE.INVALID_FACT, "receiver is same with sender address"));
            Assert.check(it.receiver.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "receiver is same with contract address"));
            Assert.check(it.amount.compare(0) >= 0, MitumError.detail(ECODE.INVALID_FACT, "amount must not be under zero"));
        });
    }
    get operationHint() {
        return HINT.TOKEN.TRANSFERS.OPERATION;
    }
};

let ApproveFact$1 = class ApproveFact extends TokenFact {
    constructor(token, sender, contract, currency, approved, amount) {
        super(HINT.TOKEN.APPROVE.FACT, token, sender, contract, currency);
        this.approved = Address.from(approved);
        this.amount = Big.from(amount);
        Assert.check(this.contract.toString() !== this.approved.toString(), MitumError.detail(ECODE.INVALID_FACT, "approved is same with contract address"));
        Assert.check(this.amount.compare(0) >= 0, MitumError.detail(ECODE.INVALID_FACT, "amount must not be under zero"));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.approved.toBuffer(),
            this.amount.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            approved: this.approved.toString(),
            amount: this.amount.toString(),
        };
    }
    get operationHint() {
        return HINT.TOKEN.APPROVE.OPERATION;
    }
};

let ApprovesItem$1 = class ApprovesItem extends TokenItem {
    constructor(contract, approved, amount, currency) {
        super(HINT.TOKEN.APPROVES.ITEM, contract, amount, currency);
        this.approved = Address.from(approved);
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.approved.toBuffer(),
            this.amount.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            approved: this.approved.toString(),
            amount: this.amount.toString(),
            currency: this.currency.toString(),
        };
    }
    toString() {
        return `${super.toString()}-${this.approved.toString()}`;
    }
};
let ApprovesFact$1 = class ApprovesFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.TOKEN.APPROVES.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicated approve found in items"));
        this.items.forEach(it => {
            Assert.check(this.sender.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
            Assert.check(it.approved.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "approved is same with contract address"));
            Assert.check(it.amount.compare(0) >= 0, MitumError.detail(ECODE.INVALID_FACT, "amount must not be under zero"));
        });
    }
    get operationHint() {
        return HINT.TOKEN.APPROVES.OPERATION;
    }
};

let TransferFromFact$1 = class TransferFromFact extends TokenFact {
    constructor(token, sender, contract, currency, receiver, target, amount) {
        super(HINT.TOKEN.TRANSFER_FROM.FACT, token, sender, contract, currency);
        this.receiver = Address.from(receiver);
        this.target = Address.from(target);
        this.amount = Big.from(amount);
        Assert.check(this.contract.toString() !== this.receiver.toString(), MitumError.detail(ECODE.INVALID_FACT, "receiver is same with contract address"));
        Assert.check(this.contract.toString() !== this.target.toString(), MitumError.detail(ECODE.INVALID_FACT, "target is same with contract address"));
        Assert.check(this.target.toString() !== this.receiver.toString(), MitumError.detail(ECODE.INVALID_FACT, "receiver is same with target address"));
        Assert.check(this.target.toString() !== this.sender.toString(), MitumError.detail(ECODE.INVALID_FACT, "target is same with sender address, use 'transfer' instead"));
        Assert.check(this.amount.overZero(), MitumError.detail(ECODE.INVALID_FACT, "amount must be over zero"));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.receiver.toBuffer(),
            this.target.toBuffer(),
            this.amount.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            receiver: this.receiver.toString(),
            target: this.target.toString(),
            amount: this.amount.toString(),
        };
    }
    get operationHint() {
        return HINT.TOKEN.TRANSFER_FROM.OPERATION;
    }
};

let TransfersFromItem$1 = class TransfersFromItem extends TokenItem {
    constructor(contract, receiver, target, amount, currency) {
        super(HINT.TOKEN.TRANSFERS_FROM.ITEM, contract, amount, currency);
        this.receiver = Address.from(receiver);
        this.target = Address.from(target);
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.receiver.toBuffer(),
            this.target.toBuffer(),
            this.amount.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            receiver: this.receiver.toString(),
            target: this.target.toString(),
            amount: this.amount.toString(),
            currency: this.currency.toString(),
        };
    }
    toString() {
        return `${super.toString()}-${this.receiver.toString()}-${this.target.toString()}`;
    }
};
let TransfersFromFact$1 = class TransfersFromFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.TOKEN.TRANSFERS_FROM.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicated target-receiver pair found in items"));
        this.items.forEach(it => {
            Assert.check(this.sender.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
            Assert.check(it.receiver.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "receiver is same with contract address"));
            Assert.check(it.target.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "target is same with contract address"));
            Assert.check(it.receiver.toString() != it.target.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "target is same with receiver address"));
            Assert.check(this.sender.toString() != it.target.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "target is same with sender address, use 'transfer' instead"));
            Assert.check(it.amount.compare(0) >= 0, MitumError.detail(ECODE.INVALID_ITEMS, "amount must not be under zero"));
        });
    }
    get operationHint() {
        return HINT.TOKEN.TRANSFERS_FROM.OPERATION;
    }
};

class Token extends ContractGenerator {
    constructor(networkID, api, delegateIP) {
        super(networkID, api, delegateIP);
    }
    /**
     * Generate a `register-model` operation to register new token model on a contract.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | LongString} [name] - The name of the token to register.
     * @param {string | CurrencyID} [symbol] - The symbol of the token to register.
     * @param {string | number | Big} [decimal] - (Optional) The decimal number to the token to register. If not provided, the default value is 0.
     * @param {string | number | Big} [initialSupply] - (Optional) The initial supply of the token to register. If not provided, the default value is 0.
     * @returns `register-model` operation.
     */
    registerModel(contract, sender, currency, name, symbol, decimal, initialSupply) {
        return new Operation$1(this.networkID, new RegisterModelFact$3(TimeStamp$1.new().UTC(), sender, contract, currency, symbol, name, decimal ?? 0, initialSupply ?? 0));
    }
    /**
     * Generate a `mint` operation for minting tokens and allocating them to a receiver.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | number | Big} [amount] - The amount to mint.
     * @returns `mint` operation.
     */
    mint(contract, sender, currency, receiver, amount) {
        return new Operation$1(this.networkID, new MintFact$1(TimeStamp$1.new().UTC(), sender, contract, currency, receiver, amount));
    }
    /**
     * Generate a `burn` operation for burning tokens from sender account.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | number | Big} [amount] - The amount to burn.
     * @returns `burn` operation
     */
    burn(contract, sender, currency, amount) {
        return new Operation$1(this.networkID, new BurnFact$1(TimeStamp$1.new().UTC(), sender, contract, currency, amount));
    }
    /**
     * Generate an `transfer` operation for transferring tokens from the sender to a receiver.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | number | Big} [amount] - The amount to transfer.
     * @returns `transfer` operation.
     */
    transfer(contract, sender, currency, receiver, amount) {
        return new Operation$1(this.networkID, new TransferFact$2(TimeStamp$1.new().UTC(), sender, contract, currency, receiver, amount));
    }
    /**
     * Generate an `transfers` operation with multi items to transfer tokens from the sender to a receiver.
     * @param {string | Address | string[] | Address[]} [contract] - A single contract address (converted to an array) or an array of multiple contract addresses.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string[] | Address[]} [receiver] - The array of receiver's address.
     * @param {string[] | number[] | Big[]} [amount] - The array of amounts to transfer.
     * @returns `transfers` operation with multi items.
     */
    multiTransfer(contract, sender, currency, receiver, amount) {
        ArrayAssert.check(receiver, "receiver").rangeLength(Config.ITEMS_IN_FACT).sameLength(amount, "amount");
        const contractsArray = convertToArray(contract, receiver.length);
        const items = Array.from({ length: receiver.length }).map((_, idx) => new TransfersItem$1(contractsArray[idx], receiver[idx], amount[idx], currency));
        return new Operation$1(this.networkID, new TransfersFact$1(TimeStamp$1.new().UTC(), sender, items));
    }
    /**
     * Generate a `transfer-from` operation for transferring tokens from target account to receiver.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | Address} [target] - The target account's address.
     * @param {string | number | Big} [amount] - The amount to transfer.
     * @returns `transfer-from` operation.
     */
    transferFrom(contract, sender, currency, receiver, target, amount) {
        return new Operation$1(this.networkID, new TransferFromFact$1(TimeStamp$1.new().UTC(), sender, contract, currency, receiver, target, amount));
    }
    /**
     * Generate a `transfers-from` operation with multi item to transfer tokens from targets account to receivers.
     * @param {string | Address | string[] | Address[]} [contract] - A single contract address (converted to an array) or an array of multiple contract addresses.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string[] | Address[]} [receiver] - The array of receiver's addresses.
     * @param {string[] | Address[]} [target] - The array of target account's addresses.
     * @param {string[] | number[] | Big[]} [amount] - The array of amounts to transfer.
     * @returns `transfer-from` operation.
     */
    multiTransferFrom(contract, sender, currency, receiver, target, amount) {
        ArrayAssert.check(receiver, "receiver")
            .rangeLength(Config.ITEMS_IN_FACT)
            .sameLength(amount, "amount")
            .sameLength(target, "target");
        const contractsArray = convertToArray(contract, receiver.length);
        const items = Array.from({ length: receiver.length }).map((_, idx) => new TransfersFromItem$1(contractsArray[idx], receiver[idx], target[idx], amount[idx], currency));
        return new Operation$1(this.networkID, new TransfersFromFact$1(TimeStamp$1.new().UTC(), sender, items));
    }
    /**
     * Generate an `approve` operation for approving certain amount tokens to approved account.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | Address} [approved] - The address to approve.
     * @param {string | number | Big} [amount] - The amount to approve.
     * @returns `approve` operation
     */
    approve(contract, sender, currency, approved, amount) {
        return new Operation$1(this.networkID, new ApproveFact$1(TimeStamp$1.new().UTC(), sender, contract, currency, approved, amount));
    }
    /**
     * Generate an `approves` operation with multi items to approve certain amount tokens to approved account.
     * @param {string | Address | string[] | Address[]} [contract] - A single contract address (converted to an array) or an array of multiple contract addresses.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string[] | Address[]} [approved] - The array of addresses to approve.
     * @param {string[] | number[] | Big[]} [amount] - The array amounts to approve.
     * @returns `approves` operation with multi item
     */
    multiApprove(contract, sender, currency, approved, amount) {
        ArrayAssert.check(approved, "approved").rangeLength(Config.ITEMS_IN_FACT).sameLength(amount, "amount");
        const contractsArray = convertToArray(contract, approved.length);
        const items = Array.from({ length: approved.length }).map((_, idx) => new ApprovesItem$1(contractsArray[idx], approved[idx], amount[idx], currency));
        return new Operation$1(this.networkID, new ApprovesFact$1(TimeStamp$1.new().UTC(), sender, items));
    }
    /**
     * Get information about the specific token model on the contract.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @returns `data` of `SuccessResponse` is token information:
     * - `_hint`: Hint for token design,
     * - `symbol`: Symbol of the token,
     * - `name`: Name of the token,
     * - `policy`: Token policy object including `_hint`, `total_supply`, `approve_list`
     */
    async getModelInfo(contract) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        return await getAPIData(() => contractApi.token.getModel(this.api, contract, this.delegateIP));
    }
    /**
     * Get the allowance information granted by the owner for a specific token.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [owner] - The token owner's address.
     * @param {string | Address} [approved] - Address of approved account.
     * @returns `data` of `SuccessResponse` is token allowance information:
     * - `amount`: String of allowance amount
     */
    async getAllowance(contract, owner, approved) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        Address.from(owner);
        Address.from(approved);
        const response = await getAPIData(() => contractApi.token.getModel(this.api, contract, this.delegateIP));
        if (isSuccessResponse(response) && response.data) {
            response.data = calculateAllowance(response, owner, approved);
        }
        return response;
    }
    /**
     * Get token balance for given account.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [account] - The token owner's address.
     * @returns`data` of `SuccessResponse` is token balance information:
     * - `amount`: String of amount
     */
    async getBalance(contract, account) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        Address.from(account);
        return await getAPIData(() => contractApi.token.getTokenBalance(this.api, contract, account, this.delegateIP));
    }
}

class PointFact extends ContractFact {
    constructor(hint, token, sender, contract, currency) {
        super(hint, token, sender, contract, currency);
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
        };
    }
}

let RegisterModelFact$2 = class RegisterModelFact extends PointFact {
    constructor(token, sender, contract, currency, symbol, name, decimal, initialSupply) {
        super(HINT.POINT.REGISTER_MODEL.FACT, token, sender, contract, currency);
        this.symbol = CurrencyID.from(symbol);
        this.name = LongString.from(name);
        this.decimal = Big.from(decimal);
        this.initialSupply = Big.from(initialSupply);
        Assert.check(this.decimal.compare(0) >= 0, MitumError.detail(ECODE.INVALID_FACT, "decimal number under zero"));
        Assert.check(this.initialSupply.compare(0) >= 0, MitumError.detail(ECODE.INVALID_FACT, "initialSupply under zero"));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.symbol.toBuffer(),
            this.name.toBuffer(),
            this.decimal.toBuffer(),
            this.initialSupply.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            symbol: this.symbol.toString(),
            name: this.name.toString(),
            decimal: this.decimal.toString(),
            initial_supply: this.initialSupply.toString(),
        };
    }
    get operationHint() {
        return HINT.POINT.REGISTER_MODEL.OPERATION;
    }
};

class MintFact extends PointFact {
    constructor(token, sender, contract, currency, receiver, amount) {
        super(HINT.POINT.MINT.FACT, token, sender, contract, currency);
        this.receiver = Address.from(receiver);
        this.amount = Big.from(amount);
        Assert.check(this.contract.toString() !== this.receiver.toString(), MitumError.detail(ECODE.INVALID_FACT, "receiver is same with contract address"));
        Assert.check(this.amount.compare(0) > 0, MitumError.detail(ECODE.INVALID_FACT, "amount must be over zero"));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.receiver.toBuffer(),
            this.amount.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            receiver: this.receiver.toString(),
            amount: this.amount.toString(),
        };
    }
    get operationHint() {
        return HINT.POINT.MINT.OPERATION;
    }
}

class BurnFact extends PointFact {
    constructor(token, sender, contract, currency, amount) {
        super(HINT.POINT.BURN.FACT, token, sender, contract, currency);
        this.target = Address.from(sender);
        this.amount = Big.from(amount);
        // Assert.check(
        //     Address.from(contract).toString() !== this.target.toString(),
        //     MitumError.detail(ECODE.INVALID_FACT, "target is same with contract address")
        // )
        Assert.check(this.amount.compare(0) > 0, MitumError.detail(ECODE.INVALID_FACT, "amount must be over zero"));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.target.toBuffer(),
            this.amount.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            target: this.target.toString(),
            amount: this.amount.toString(),
        };
    }
    get operationHint() {
        return HINT.POINT.BURN.OPERATION;
    }
}

let TransferFact$1 = class TransferFact extends PointFact {
    constructor(token, sender, contract, currency, receiver, amount) {
        super(HINT.POINT.TRANSFER.FACT, token, sender, contract, currency);
        this.receiver = Address.from(receiver);
        this.amount = Big.from(amount);
        Assert.check(this.contract.toString() !== this.receiver.toString(), MitumError.detail(ECODE.INVALID_FACT, "receiver is same with contract address"));
        Assert.check(this.receiver.toString() !== this.sender.toString(), MitumError.detail(ECODE.INVALID_FACT, "receiver is same with sender address"));
        Assert.check(this.amount.compare(0) > 0, MitumError.detail(ECODE.INVALID_FACT, "amount must be over zero"));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.receiver.toBuffer(),
            this.amount.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            receiver: this.receiver.toString(),
            amount: this.amount.toString(),
        };
    }
    get operationHint() {
        return HINT.POINT.TRANSFER.OPERATION;
    }
};

class PointItem extends Item {
    constructor(hint, contract, amount, currency) {
        super(hint);
        this.contract = Address.from(contract);
        this.amount = Big.from(amount);
        this.currency = CurrencyID.from(currency);
    }
    toBuffer() {
        return this.contract.toBuffer();
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            contract: this.contract.toString(),
        };
    }
    toString() {
        return this.contract.toString();
    }
}

class TransfersItem extends PointItem {
    constructor(contract, receiver, amount, currency) {
        super(HINT.POINT.TRANSFERS.ITEM, contract, amount, currency);
        this.receiver = Address.from(receiver);
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.receiver.toBuffer(),
            this.amount.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            receiver: this.receiver.toString(),
            amount: this.amount.toString(),
            currency: this.currency.toString(),
        };
    }
    toString() {
        return `${super.toString()}-${this.receiver.toString()}`;
    }
}
class TransfersFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.POINT.TRANSFERS.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicated receiver found in items"));
        this.items.forEach(it => {
            Assert.check(this.sender.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
            Assert.check(it.receiver.toString() !== this.sender.toString(), MitumError.detail(ECODE.INVALID_FACT, "receiver is same with sender address"));
            Assert.check(it.receiver.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "receiver is same with contract address"));
            Assert.check(it.amount.compare(0) >= 0, MitumError.detail(ECODE.INVALID_FACT, "amount must not be under zero"));
        });
    }
    get operationHint() {
        return HINT.POINT.TRANSFERS.OPERATION;
    }
}

class ApproveFact extends PointFact {
    constructor(token, sender, contract, currency, approved, amount) {
        super(HINT.POINT.APPROVE.FACT, token, sender, contract, currency);
        this.approved = Address.from(approved);
        this.amount = Big.from(amount);
        Assert.check(this.contract.toString() !== this.approved.toString(), MitumError.detail(ECODE.INVALID_FACT, "approved is same with contract address"));
        Assert.check(this.amount.compare(0) >= 0, MitumError.detail(ECODE.INVALID_FACT, "amount must not be under zero"));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.approved.toBuffer(),
            this.amount.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            approved: this.approved.toString(),
            amount: this.amount.toString(),
        };
    }
    get operationHint() {
        return HINT.POINT.APPROVE.OPERATION;
    }
}

class ApprovesItem extends PointItem {
    constructor(contract, approved, amount, currency) {
        super(HINT.POINT.APPROVES.ITEM, contract, amount, currency);
        this.approved = Address.from(approved);
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.approved.toBuffer(),
            this.amount.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            approved: this.approved.toString(),
            amount: this.amount.toString(),
            currency: this.currency.toString(),
        };
    }
    toString() {
        return `${super.toString()}-${this.approved.toString()}`;
    }
}
class ApprovesFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.POINT.APPROVES.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicated approve found in items"));
        this.items.forEach(it => {
            Assert.check(this.sender.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
            Assert.check(it.approved.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "approved is same with contract address"));
            Assert.check(it.amount.compare(0) >= 0, MitumError.detail(ECODE.INVALID_FACT, "amount must not be under zero"));
        });
    }
    get operationHint() {
        return HINT.POINT.APPROVES.OPERATION;
    }
}

class TransferFromFact extends PointFact {
    constructor(token, sender, contract, currency, receiver, target, amount) {
        super(HINT.POINT.TRANSFER_FROM.FACT, token, sender, contract, currency);
        this.receiver = Address.from(receiver);
        this.target = Address.from(target);
        this.amount = Big.from(amount);
        Assert.check(this.contract.toString() !== this.receiver.toString(), MitumError.detail(ECODE.INVALID_FACT, "receiver is same with contract address"));
        Assert.check(this.contract.toString() !== this.target.toString(), MitumError.detail(ECODE.INVALID_FACT, "target is same with contract address"));
        Assert.check(this.target.toString() !== this.receiver.toString(), MitumError.detail(ECODE.INVALID_FACT, "receiver is same with target address"));
        Assert.check(this.target.toString() !== this.sender.toString(), MitumError.detail(ECODE.INVALID_FACT, "target is same with sender address, use 'transfer' instead"));
        Assert.check(this.amount.compare(0) > 0, MitumError.detail(ECODE.INVALID_FACT, "amount must be over zero"));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.receiver.toBuffer(),
            this.target.toBuffer(),
            this.amount.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            receiver: this.receiver.toString(),
            target: this.target.toString(),
            amount: this.amount.toString(),
        };
    }
    get operationHint() {
        return HINT.POINT.TRANSFER_FROM.OPERATION;
    }
}

class TransfersFromItem extends PointItem {
    constructor(contract, receiver, target, amount, currency) {
        super(HINT.POINT.TRANSFERS_FROM.ITEM, contract, amount, currency);
        this.receiver = Address.from(receiver);
        this.target = Address.from(target);
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.receiver.toBuffer(),
            this.target.toBuffer(),
            this.amount.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            receiver: this.receiver.toString(),
            target: this.target.toString(),
            amount: this.amount.toString(),
            currency: this.currency.toString(),
        };
    }
    toString() {
        return `${super.toString()}-${this.receiver.toString()}-${this.target.toString()}`;
    }
}
class TransfersFromFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.POINT.TRANSFERS_FROM.FACT, token, sender, items);
        Assert.check(new Set(items.map(it => it.toString())).size === items.length, MitumError.detail(ECODE.INVALID_ITEMS, "duplicated target-receiver pair found in items"));
        this.items.forEach(it => {
            Assert.check(this.sender.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
            Assert.check(it.receiver.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "receiver is same with contract address"));
            Assert.check(it.target.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "target is same with contract address"));
            Assert.check(it.receiver.toString() != it.target.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "target is same with receiver address"));
            Assert.check(this.sender.toString() != it.target.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "target is same with sender address, use 'transfer' instead"));
            Assert.check(it.amount.compare(0) >= 0, MitumError.detail(ECODE.INVALID_ITEMS, "amount must not be under zero"));
        });
    }
    get operationHint() {
        return HINT.POINT.TRANSFERS_FROM.OPERATION;
    }
}

class Point extends ContractGenerator {
    constructor(networkID, api, delegateIP) {
        super(networkID, api, delegateIP);
    }
    /**
     * Generate a `register-model` operation to register new point model on a contract.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | LongString} [name] - The name of the point to register.
     * @param {string | CurrencyID} [symbol] - The symbol of the point to register.
     * @param {string | number | Big} [decimal] - (Optional) The decimal number to the point to register. If not provided, the default value is 0.
     * @param {string | number | Big} [initialSupply] - (Optional) The initial supply of the point to register. If not provided, the default value is 0.
     * @returns `register-model` operation.
     */
    registerModel(contract, sender, currency, name, symbol, decimal, initialSupply) {
        return new Operation$1(this.networkID, new RegisterModelFact$2(TimeStamp$1.new().UTC(), sender, contract, currency, symbol, name, decimal ?? 0, initialSupply ?? 0));
    }
    /**
     * Generate a `mint` operation for minting points and allocating them to a receiver.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | number | Big} [amount] - The amount to mint.
     * @returns `mint` operation.
     */
    mint(contract, sender, currency, receiver, amount) {
        return new Operation$1(this.networkID, new MintFact(TimeStamp$1.new().UTC(), sender, contract, currency, receiver, amount));
    }
    /**
     * Generate a `burn` operation for burning points from sender account.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | number | Big} [amount] - The amount to burn.
     * @returns `burn` operation
     */
    burn(contract, sender, currency, amount) {
        return new Operation$1(this.networkID, new BurnFact(TimeStamp$1.new().UTC(), sender, contract, currency, amount));
    }
    /**
     * Generate an `transfer` operation for transferring points from the sender to a receiver.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | number | Big} [amount] - The amount to transfer.
     * @returns `transfer` operation.
     */
    transfer(contract, sender, currency, receiver, amount) {
        return new Operation$1(this.networkID, new TransferFact$1(TimeStamp$1.new().UTC(), sender, contract, currency, receiver, amount));
    }
    /**
     * Generate an `transfers` operation with multi items to transfer points from the sender to a receiver.
     * @param {string | Address | string[] | Address[]} [contract] - A single contract address (converted to an array) or an array of multiple contract addresses.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string[] | Address[]} [receiver] - The array of receiver's address.
     * @param {string[] | number[] | Big[]} [amount] - The array of amounts to transfer.
     * @returns `transfers` operation with multi items.
     */
    multiTransfer(contract, sender, currency, receiver, amount) {
        ArrayAssert.check(receiver, "receiver").rangeLength(Config.ITEMS_IN_FACT).sameLength(amount, "amount");
        const contractsArray = convertToArray(contract, receiver.length);
        const items = Array.from({ length: receiver.length }).map((_, idx) => new TransfersItem(contractsArray[idx], receiver[idx], amount[idx], currency));
        return new Operation$1(this.networkID, new TransfersFact(TimeStamp$1.new().UTC(), sender, items));
    }
    /**
     * Generate a `transfer-from` operation for transferring points from target account to receiver.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | Address} [target] - The target account's address.
     * @param {string | number | Big} [amount] - The amount to transfer.
     * @returns `transfer-from` operation.
     */
    transferFrom(contract, sender, currency, receiver, target, amount) {
        return new Operation$1(this.networkID, new TransferFromFact(TimeStamp$1.new().UTC(), sender, contract, currency, receiver, target, amount));
    }
    /**
     * Generate a `transfers-from` operation with multi item to transfer points from targets account to receivers.
     * @param {string | Address | string[] | Address[]} [contract] - A single contract address (converted to an array) or an array of multiple contract addresses.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string[] | Address[]} [receiver] - The array of receiver's addresses.
     * @param {string[] | Address[]} [target] - The array of target account's addresses.
     * @param {string[] | number[] | Big[]} [amount] - The array of amounts to transfer.
     * @returns `transfer-from` operation.
     */
    multiTransferFrom(contract, sender, currency, receiver, target, amount) {
        ArrayAssert.check(receiver, "receiver")
            .rangeLength(Config.ITEMS_IN_FACT)
            .sameLength(amount, "amount")
            .sameLength(target, "target");
        const contractsArray = convertToArray(contract, receiver.length);
        const items = Array.from({ length: receiver.length }).map((_, idx) => new TransfersFromItem(contractsArray[idx], receiver[idx], target[idx], amount[idx], currency));
        return new Operation$1(this.networkID, new TransfersFromFact(TimeStamp$1.new().UTC(), sender, items));
    }
    /**
     * Generate an `approve` operation for approving certain amount points to approved account.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string | Address} [approved] - The address to approve.
     * @param {string | number | Big} [amount] - The amount to approve.
     * @returns `approve` operation
     */
    approve(contract, sender, currency, approved, amount) {
        return new Operation$1(this.networkID, new ApproveFact(TimeStamp$1.new().UTC(), sender, contract, currency, approved, amount));
    }
    /**
     * Generate an `approves` operation with multi items to approve certain amount points to approved account.
     * @param {string | Address | string[] | Address[]} [contract] - A single contract address (converted to an array) or an array of multiple contract addresses.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @param {string[] | Address[]} [approved] - The array of addresses to approve.
     * @param {string[] | number[] | Big[]} [amount] - The array amounts to approve.
     * @returns `approves` operation with multi item
     */
    multiApprove(contract, sender, currency, approved, amount) {
        ArrayAssert.check(approved, "approved").rangeLength(Config.ITEMS_IN_FACT).sameLength(amount, "amount");
        const contractsArray = convertToArray(contract, approved.length);
        const items = Array.from({ length: approved.length }).map((_, idx) => new ApprovesItem(contractsArray[idx], approved[idx], amount[idx], currency));
        return new Operation$1(this.networkID, new ApprovesFact(TimeStamp$1.new().UTC(), sender, items));
    }
    /**
     * Get information about the specific point model on the contract.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @returns `data` of `SuccessResponse` is point information:
     * - `_hint`: Hint for point design,
     * - `symbol`: Symbol of the point,
     * - `name`: Name of the point,
     * - `policy`: Point policy object including `_hint`, `total_supply`, `approve_list`
     */
    async getModelInfo(contract) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        return await getAPIData(() => contractApi.point.getModel(this.api, contract, this.delegateIP));
    }
    /**
     * Get the allowance information granted by the owner for a specific point.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [owner] - The point owner's address.
     * @param {string | Address} [approved] - Address of approved account.
     * @returns `data` of `SuccessResponse` is point allowance information:
     * - `amount`: String of allowance amount
     */
    async getAllowance(contract, owner, approved) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        Address.from(owner);
        Address.from(approved);
        const response = await getAPIData(() => contractApi.point.getModel(this.api, contract, this.delegateIP));
        if (isSuccessResponse(response) && response.data) {
            response.data = calculateAllowance(response, owner, approved);
        }
        return response;
    }
    /**
     * Get point balance for given account.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [account] - The point owner's address.
     * @returns `data` of `SuccessResponse` is point balance information:
     * - `amount`: String of amount
     */
    async getBalance(contract, account) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        Address.from(account);
        return await getAPIData(() => contractApi.point.getPointBalance(this.api, contract, account, this.delegateIP));
    }
}

let RegisterModelFact$1 = class RegisterModelFact extends ContractFact {
    constructor(token, sender, contract, project, currency) {
        super(HINT.STORAGE.REGISTER_MODEL.FACT, token, sender, contract, currency);
        Assert.check(Config.STORAGE.PROJECT.satisfy(project.toString().length), MitumError.detail(ECODE.INVALID_FACT, `project length out of range, should be between ${Config.STORAGE.PROJECT.min} to ${Config.STORAGE.PROJECT.max}`));
        this.project = LongString.from(project);
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.project.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            project: this.project.toString(),
        };
    }
    get operationHint() {
        return HINT.STORAGE.REGISTER_MODEL.OPERATION;
    }
};

class StorageFact extends ContractFact {
    constructor(hint, token, sender, contract, dataKey, currency) {
        super(hint, token, sender, contract, currency);
        this.dataKey = LongString.from(dataKey);
        // Assert.check(
        //     this.decimal.compare(0) >= 0,
        //     MitumError.detail(ECODE.INVALID_FACT, "decimal number under zero"),
        // )
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.dataKey.toBuffer()
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            dataKey: this.dataKey.toString(),
        };
    }
}

class CreateDataFact extends StorageFact {
    constructor(token, sender, contract, dataKey, dataValue, currency) {
        super(HINT.STORAGE.CREATE_DATA.FACT, token, sender, contract, dataKey, currency);
        this.dataValue = LongString.from(dataValue);
        Assert.check(Config.STORAGE.DATA_KEY.satisfy(dataKey.toString().length), MitumError.detail(ECODE.INVALID_FACT, `dataKey length out of range, should be between ${Config.STORAGE.DATA_KEY.min} to ${Config.STORAGE.DATA_KEY.max}`));
        Assert.check(Config.STORAGE.DATA_VALUE.satisfy(dataValue.toString().length), MitumError.detail(ECODE.INVALID_FACT, `dataValue out of range, should be between ${Config.STORAGE.DATA_VALUE.min} to ${Config.STORAGE.DATA_VALUE.max}`));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.dataValue.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            dataValue: this.dataValue.toString(),
        };
    }
    get operationHint() {
        return HINT.STORAGE.CREATE_DATA.OPERATION;
    }
}

class CreateDatasItem extends Item {
    constructor(contract, currency, dataKey, dataValue) {
        super(HINT.STORAGE.CREATE_DATAS.ITEM);
        this.contract = Address.from(contract);
        this.currency = CurrencyID.from(currency);
        this.dataKey = LongString.from(dataKey);
        this.dataValue = LongString.from(dataValue);
        Assert.check(Config.STORAGE.DATA_KEY.satisfy(dataKey.toString().length), MitumError.detail(ECODE.INVALID_ITEM, `dataKey length out of range, should be between ${Config.STORAGE.DATA_KEY.min} to ${Config.STORAGE.DATA_KEY.max}`));
        Assert.check(Config.STORAGE.DATA_VALUE.satisfy(dataValue.toString().length), MitumError.detail(ECODE.INVALID_ITEM, `dataValue out of range, should be between ${Config.STORAGE.DATA_VALUE.min} to ${Config.STORAGE.DATA_VALUE.max}`));
    }
    toBuffer() {
        return Buffer.concat([
            this.contract.toBuffer(),
            this.dataKey.toBuffer(),
            this.dataValue.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            contract: this.contract.toString(),
            dataKey: this.dataKey.toString(),
            dataValue: this.dataValue.toString(),
            currency: this.currency.toString(),
        };
    }
    toString() {
        return this.dataKey.toString() + this.contract.toString();
    }
}
class CreateDatasFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.STORAGE.CREATE_DATAS.FACT, token, sender, items);
        this.items.forEach(it => {
            new URIString(it.dataKey.toString(), 'dataKey');
            Assert.check(this.sender.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
        });
        // duplicated item check has already confirmed that contract-dataKey is unique.
        // Assert.check(
        //     new Set(items.map(item => item.dataKey.toString() + item.contract.toString())).size === items.length,
        //     MitumError.detail(ECODE.INVALID_ITEMS, "duplicate dataKey found in items")
        // )
    }
    get operationHint() {
        return HINT.STORAGE.CREATE_DATAS.OPERATION;
    }
}

class UpdateDataFact extends StorageFact {
    constructor(token, sender, contract, dataKey, dataValue, currency) {
        super(HINT.STORAGE.UPDATE_DATA.FACT, token, sender, contract, dataKey, currency);
        this.dataValue = LongString.from(dataValue);
        Assert.check(Config.STORAGE.DATA_KEY.satisfy(dataKey.toString().length), MitumError.detail(ECODE.INVALID_FACT, `dataKey length out of range, should be between ${Config.STORAGE.DATA_KEY.min} to ${Config.STORAGE.DATA_KEY.max}`));
        Assert.check(Config.STORAGE.DATA_VALUE.satisfy(dataValue.toString().length), MitumError.detail(ECODE.INVALID_FACT, `dataValue out of range, should be between ${Config.STORAGE.DATA_VALUE.min} to ${Config.STORAGE.DATA_VALUE.max}`));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.dataValue.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            dataValue: this.dataValue.toString(),
        };
    }
    get operationHint() {
        return HINT.STORAGE.UPDATE_DATA.OPERATION;
    }
}

class UpdateDatasItem extends Item {
    constructor(contract, currency, dataKey, dataValue) {
        super(HINT.STORAGE.UPDATE_DATAS.ITEM);
        this.contract = Address.from(contract);
        this.currency = CurrencyID.from(currency);
        this.dataKey = LongString.from(dataKey);
        this.dataValue = LongString.from(dataValue);
        Assert.check(Config.STORAGE.DATA_KEY.satisfy(dataKey.toString().length), MitumError.detail(ECODE.INVALID_ITEM, `dataKey length out of range, should be between ${Config.STORAGE.DATA_KEY.min} to ${Config.STORAGE.DATA_KEY.max}`));
        Assert.check(Config.STORAGE.DATA_VALUE.satisfy(dataValue.toString().length), MitumError.detail(ECODE.INVALID_ITEM, `dataValue out of range, should be between ${Config.STORAGE.DATA_VALUE.min} to ${Config.STORAGE.DATA_VALUE.max}`));
    }
    toBuffer() {
        return Buffer.concat([
            this.contract.toBuffer(),
            this.dataKey.toBuffer(),
            this.dataValue.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            contract: this.contract.toString(),
            dataKey: this.dataKey.toString(),
            dataValue: this.dataValue.toString(),
            currency: this.currency.toString(),
        };
    }
    toString() {
        return this.dataKey.toString() + this.contract.toString();
    }
}
class UpdateDatasFact extends OperationFact {
    constructor(token, sender, items) {
        super(HINT.STORAGE.UPDATE_DATAS.FACT, token, sender, items);
        this.items.forEach(it => {
            new URIString(it.dataKey.toString(), 'dataKey');
            Assert.check(this.sender.toString() != it.contract.toString(), MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"));
        });
    }
    get operationHint() {
        return HINT.STORAGE.UPDATE_DATAS.OPERATION;
    }
}

class DeleteDataFact extends StorageFact {
    constructor(token, sender, contract, dataKey, currency) {
        super(HINT.STORAGE.DELETE_DATA.FACT, token, sender, contract, dataKey, currency);
        Assert.check(Config.STORAGE.DATA_KEY.satisfy(dataKey.toString().length), MitumError.detail(ECODE.INVALID_FACT, `dataKey length out of range, should be between ${Config.STORAGE.DATA_KEY.min} to ${Config.STORAGE.DATA_KEY.max}`));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
        };
    }
    get operationHint() {
        return HINT.STORAGE.DELETE_DATA.OPERATION;
    }
}

class Storage extends ContractGenerator {
    constructor(networkID, api, delegateIP) {
        super(networkID, api, delegateIP);
    }
    /**
     * Generate a `register-model` operation to register new storage model on the contract.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | LongString} [project] - The project's name
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `register-model` operation.
     */
    registerModel(contract, sender, project, currency) {
        return new Operation$1(this.networkID, new RegisterModelFact$1(TimeStamp$1.new().UTC(), sender, contract, project, currency));
    }
    /**
     * Generate `create-data` operation to create data with new data key on the storage model.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [dataKey] - The key of data to create.
     * @param {string | LongString} [dataValue] - Value of the data to record.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `create-data` operation
     */
    createData(contract, sender, dataKey, dataValue, currency) {
        new URIString(dataKey, 'dataKey');
        const fact = new CreateDataFact(TimeStamp$1.new().UTC(), sender, contract, dataKey, dataValue, currency);
        return new Operation$1(this.networkID, fact);
    }
    /**
     * Generate `create-datas` operation to create multiple data on the storage model.
     * @param {string | Address | string[] | Address[]} [contract] - A single contract address (converted to an array) or an array of multiple contract addresses.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string[]} [dataKeys] - The array with key of multiple data to create.
     * @param {string[] | LongString[]} [dataValues] - The array with value of the multiple data to record.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `create-datas` operation
     */
    createMultiData(contract, sender, dataKeys, dataValues, currency) {
        ArrayAssert.check(dataKeys, "dataKeys")
            .rangeLength(Config.ITEMS_IN_FACT)
            .sameLength(dataValues, "dataValues");
        const contractsArray = convertToArray(contract, dataKeys.length);
        const items = dataKeys.map((_, idx) => new CreateDatasItem(contractsArray[idx], currency, dataKeys[idx], dataValues[idx]));
        return new Operation$1(this.networkID, new CreateDatasFact(TimeStamp$1.new().UTC(), sender, items));
    }
    /**
     * Generate `update-data` operation to update data with exist data key on the storage model.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [dataKey] - The key of data to update.
     * @param {string | LongString} [dataValue] - Value of the data to be updated.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `update-data` operation
     */
    updateData(contract, sender, dataKey, dataValue, currency) {
        new URIString(dataKey, 'dataKey');
        const fact = new UpdateDataFact(TimeStamp$1.new().UTC(), sender, contract, dataKey, dataValue, currency);
        return new Operation$1(this.networkID, fact);
    }
    /**
     * Generate `update-datas` operation to update multiple data on the storage model.
     * @param {string | Address | string[] | Address[]} [contract] - A single contract address (converted to an array) or an array of multiple contract addresses.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string[]} [dataKeys] - The array with key of multiple data to update.
     * @param {string[] | LongString[]} [dataValues] - The array with value of the multiple data to update.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `update-datas` operation
     */
    updateMultiData(contract, sender, dataKeys, dataValues, currency) {
        ArrayAssert.check(dataKeys, "dataKeys")
            .rangeLength(Config.ITEMS_IN_FACT)
            .sameLength(dataValues, "dataValues");
        const contractsArray = convertToArray(contract, dataKeys.length);
        const items = dataKeys.map((_, idx) => new UpdateDatasItem(contractsArray[idx], currency, dataKeys[idx], dataValues[idx]));
        return new Operation$1(this.networkID, new UpdateDatasFact(TimeStamp$1.new().UTC(), sender, items));
    }
    /**
     * Generate `delete-data` operation to delete data on the storage model.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string} [dataKey] - The key of data to delete.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `delete-data` operation
     */
    deleteData(contract, sender, dataKey, currency) {
        new URIString(dataKey, 'dataKey');
        const fact = new DeleteDataFact(TimeStamp$1.new().UTC(), sender, contract, dataKey, currency);
        return new Operation$1(this.networkID, fact);
    }
    /**
     * Get information about a storage model on the contract.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @returns `data` of `SuccessResponse` is information about the storage service:
     * - `_hint`: Hint for storage design,
     * - `project`: Project's name
     */
    async getModelInfo(contract) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        return await getAPIData(() => contractApi.storage.getModel(this.api, contract, this.delegateIP));
    }
    /**
     * Get detailed information about a specific data on the project.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | LongString} [dataKey] - The key of the data to search.
     * @returns `data` of `SuccessResponse` is information about the data with certain dataKey on the project:
     * - `data`: Object containing below information
     * - - `dataKey`: The key associated with the data,
     * - - `dataValue`: The current value of the data,
     * - - `deleted`: Indicates whether the data has been deleted
     * - `height`: The block number where the latest related operation is recorded,
     * - `operation`: The fact hash of the latest related operation,
     * - `timestamp`: The timestamp of the latest related operation (prposed_at of block manifest)
     */
    async getData(contract, dataKey) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        new URIString(dataKey, 'dataKey');
        return await getAPIData(() => contractApi.storage.getData(this.api, contract, dataKey, this.delegateIP));
    }
    /**
     * Get all history information about a specific data on the project.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | LongString} [dataKey] - The key of the data to search.
     * @param {number} [limit] - (Optional) The maximum number of history to retrieve.
     * @param {number} [offset] - (Optional) The Offset setting value based on block height
     * @param {boolean} [reverse] - (Optional) Whether to return the history in reverse newest order.
     * @returns `data` of `SuccessResponse` is an array of the history information about the data:
     * - `_hint`: Hint for currency,
     * - `_embedded`:
     * - - `data`: Object containing below information
     * - - - `dataKey`: The key associated with the data,
     * - - - `dataValue`: The current value of the data,
     * - - - `deleted`: Indicates whether the data has been deleted
     * - - `height`: The block number where the latest related operation is recorded,
     * - - `operation`: The fact hash of the latest related operation,
     * - - `timestamp`: The timestamp of the latest related operation (prposed_at of block manifest),
     * - `_links`: Links for additional information
     */
    async getDataHistory(contract, dataKey, limit, offset, reverse) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Address.from(contract);
        new URIString(dataKey, 'dataKey');
        return await getAPIData(() => contractApi.storage.getDataHistory(this.api, contract, dataKey, this.delegateIP, limit, offset, reverse));
    }
    /**
     * Get the number of data (not deleted). If `deleted` is true, the number including deleted data.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {boolean} [deleted] - (Optional) Whether to include deleted data.
     * @returns `data` of `SuccessResponse` is an array of the history information about the data:
     * - `contract`: The address of contract account,
     * - `data_count`: The number of created data on the contract
     */
    async getDataCount(contract, deleted) {
        Address.from(contract);
        return await getAPIData(() => contractApi.storage.getDataCount(this.api, contract, this.delegateIP, deleted));
    }
}

class PaymentFact extends ContractFact {
    constructor(hint, token, sender, contract, currency) {
        super(hint, token, sender, contract, currency);
        // this._hash = this.hashing()
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
        };
    }
}

class RegisterModelFact extends PaymentFact {
    constructor(token, sender, contract, currency) {
        super(HINT.PAYMENT.REGISTER_MODEL.FACT, token, sender, contract, currency);
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.currency.toBuffer()
        ]);
    }
    get operationHint() {
        return HINT.PAYMENT.REGISTER_MODEL.OPERATION;
    }
}

class DepositFact extends PaymentFact {
    constructor(token, sender, contract, currency, amount, transfer_limit, start_time, end_time, duration) {
        super(HINT.PAYMENT.DEPOSIT.FACT, token, sender, contract, currency);
        this.amount = Big.from(amount);
        this.transfer_limit = Big.from(transfer_limit);
        this.start_time = Big.from(start_time);
        this.end_time = Big.from(end_time);
        this.duration = Big.from(duration);
        Assert.check(this.amount.overZero(), MitumError.detail(ECODE.INVALID_FACT, "amount must be greater 0"));
        Assert.check(this.start_time.v < this.end_time.v, MitumError.detail(ECODE.INVALID_FACT, "end_time must be greater than start_time"));
        Assert.check(this.duration.v < this.end_time.v - this.start_time.v, MitumError.detail(ECODE.INVALID_FACT, "duration must be less than (end_time - start_time)"));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.amount.toBuffer(),
            this.transfer_limit.toBuffer(),
            this.start_time.toBuffer("fill"),
            this.end_time.toBuffer("fill"),
            this.duration.toBuffer("fill"),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            amount: this.amount.toString(),
            transfer_limit: this.transfer_limit.toString(),
            start_time: this.start_time.v,
            end_time: this.end_time.v,
            duration: this.duration.v,
        };
    }
    get operationHint() {
        return HINT.PAYMENT.DEPOSIT.OPERATION;
    }
}

class TransferFact extends PaymentFact {
    constructor(token, sender, contract, currency, receiver, amount) {
        super(HINT.PAYMENT.TRANSFER.FACT, token, sender, contract, currency);
        this.amount = Big.from(amount);
        this.receiver = Address.from(receiver);
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.receiver.toBuffer(),
            this.amount.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            receiver: this.receiver.toString(),
            amount: this.amount.toString(),
        };
    }
    get operationHint() {
        return HINT.PAYMENT.TRANSFER.OPERATION;
    }
}

class WithdrawFact extends PaymentFact {
    constructor(token, sender, contract, currency) {
        super(HINT.PAYMENT.WITHDRAW.FACT, token, sender, contract, currency);
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.currency.toBuffer(),
        ]);
    }
    get operationHint() {
        return HINT.PAYMENT.WITHDRAW.OPERATION;
    }
}

class UpdateFact extends PaymentFact {
    constructor(token, sender, contract, currency, transfer_limit, start_time, end_time, duration) {
        super(HINT.PAYMENT.UPDATE_ACCOUNT_SETTING.FACT, token, sender, contract, currency);
        this.transfer_limit = Big.from(transfer_limit);
        this.start_time = Big.from(start_time);
        this.end_time = Big.from(end_time);
        this.duration = Big.from(duration);
        Assert.check(this.start_time.v < this.end_time.v, MitumError.detail(ECODE.INVALID_FACT, "end_time must be greater than start_time"));
        Assert.check(this.duration.v < this.end_time.v - this.start_time.v, MitumError.detail(ECODE.INVALID_FACT, "duration must be less than (end_time - start_time)"));
        this._hash = this.hashing();
    }
    toBuffer() {
        return Buffer.concat([
            super.toBuffer(),
            this.transfer_limit.toBuffer(),
            this.start_time.toBuffer("fill"),
            this.end_time.toBuffer("fill"),
            this.duration.toBuffer("fill"),
            this.currency.toBuffer(),
        ]);
    }
    toHintedObject() {
        return {
            ...super.toHintedObject(),
            transfer_limit: this.transfer_limit.toString(),
            start_time: this.start_time.v,
            end_time: this.end_time.v,
            duration: this.duration.v,
        };
    }
    get operationHint() {
        return HINT.PAYMENT.UPDATE_ACCOUNT_SETTING.OPERATION;
    }
}

class Payment extends ContractGenerator {
    constructor(networkID, api, delegateIP) {
        super(networkID, api, delegateIP);
    }
    /**
     * Generate a `register-model` operation to register new payment model on the contract.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `register-model` operation.
     */
    registerModel(contract, sender, currency) {
        return new Operation$1(this.networkID, new RegisterModelFact(TimeStamp$1.new().UTC(), sender, contract, currency));
    }
    /**
     * Generate `deposit` operation to deposit currency to a payment model with configurable transfer settings.
     *
     * amount > 0 && end_time > start_time && duration <= (end_time - start_time)
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | number | Big} [amount] - The amount to deposit.
     * @param {string | number} [transfer_limit] - The maximum amount that can be sent in a single transaction.
     * @param {string | number | Big} [start_time] - The start time when a transfer becomes possible.
     * @param {string | number | Big} [end_time] - The end time after which a transfer is no longer allowed.
     * @param {string | number | Big} [duration] - The cooldown period (in seconds) after the last transfer, during which further transfers are blocked.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `deposit` operation
     */
    deposit(contract, sender, amount, transfer_limit, start_time, end_time, duration, currency) {
        const fact = new DepositFact(TimeStamp$1.new().UTC(), sender, contract, currency, amount, transfer_limit, start_time, end_time, duration);
        return new Operation$1(this.networkID, fact);
    }
    /**
     * Generate `update-account-setting` operation to update transfer setting.
     *
     * end_time > start_time && duration <= (end_time - start_time)
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | number} [transfer_limit] - The maximum amount that can be sent in a single transaction.
     * @param {string | number | Big} [start_time] - The start time when a transfer becomes possible.
     * @param {string | number | Big} [end_time] - The end time after which a transfer is no longer allowed.
     * @param {string | number | Big} [duration] - The cooldown period (in seconds) after the last transfer, during which further transfers are blocked.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `update-account-setting` operation
     */
    updateSetting(contract, sender, transfer_limit, start_time, end_time, duration, currency) {
        const fact = new UpdateFact(TimeStamp$1.new().UTC(), sender, contract, currency, transfer_limit, start_time, end_time, duration);
        return new Operation$1(this.networkID, fact);
    }
    /**
     * Generate an `transfer` operation for transferring certain currency from the deposit to a receiver.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | Address} [receiver] - The receiver's address.
     * @param {string | number | Big} [amount] - The amount to transfer.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `transfer` operation.
     */
    transfer(contract, sender, receiver, amount, currency) {
        return new Operation$1(this.networkID, new TransferFact(TimeStamp$1.new().UTC(), sender, contract, currency, receiver, amount));
    }
    /**
     * Generate an `withdraw` operation to withdraw all deposits with certain currency at once and delete account information.
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [sender] - The sender's address.
     * @param {string | CurrencyID} [currency] - The currency ID.
     * @returns `withdraw` operation.
     */
    withdraw(contract, sender, currency) {
        return new Operation$1(this.networkID, new WithdrawFact(TimeStamp$1.new().UTC(), sender, contract, currency));
    }
    /**
     * Get information about a payment service on the contract.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @returns `data` of `SuccessResponse` is information about the payment service:
     * - `_hint`: Hint for the payment design structure,
     * - `transfer_settings`: A mapping of addresses to their respective payment settings,
     * - - `<address>`: A unique identifier for each user's payment setting,
     * - - - `_hint`: Hint for the payment setting structure,
     * - - - `address`: The address associated with this payment setting,
     * - - - `items`: A mapping of tokens to their transfer conditions,
     * - - - - `<currency id>`: The currency id,
     * - - - - - `transfer_limit`: The maximum amount that can be transferred,
     * - - - - - `start_time`: The start time when a transfer becomes possible,
     * - - - - - `end_time`: The end time after which a transfer is no longer allowed,
     * - - - - - `duration`: The cooldown period after the last transfer, during which further transfers are blocked.
     */
    async getModelInfo(contract) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        return await getAPIData(() => contractApi.payment.getModel(this.api, contract, this.delegateIP));
    }
    /**
     * Get information about the remaining deposit and transfer settings for a given user address.
     * @async
     * @param {string | Address} [contract] - The contract's address.
     * @param {string | Address} [address] - The address of account.
     * @returns `data` of `SuccessResponse` is information about the timestamp with certain tid on the certain project:
     * - `_hint`: Hint for the payment account information structure,
     * - `transfer_setting`: Transfer conditions set for the account,
     * - - `_hint`: Hint for the payment setting structure,
     * - - `address`: The address associated with this payment setting,
     * - - `items`: A mapping of tokens to their transfer conditions,
     * - - - `<currency id>`: The currency id,
     * - - - - `transfer_limit`: The maximum amount that can be transferred,
     * - - - - `start_time`: The start time when a transfer becomes possible,
     * - - - - `end_time`: The end time after which a transfer is no longer allowed,
     * - - - - `duration`: The cooldown period after the last transfer, during which further transfers are blocked.
     * - `deposit_record`: Deposit details of the account,
     * - - `_hint`: Hint for the deposit record structure,
     * - - `address`: The address associated with this deposit record,
     * - - `items`: A mapping of tokens to their deposit information,
     * - - - `<currency id>`: The currency id,
     * - - - - `amount`: The remainning deposited,
     * - - - - `transferred_at`: The timestamp of the last transfer (Unix timestamp).
     */
    async getPaymentInfo(contract, address) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        return await getAPIData(() => contractApi.payment.getAccountInfo(this.api, contract, address, this.delegateIP));
    }
}

class Signer extends Generator {
    constructor(networkID, api) {
        super(networkID, api);
    }
    /**
     * Sign the given operation in JSON format using given private key.
     * @param {string | Key} [privatekey] - The private key used for signing.
     * @param {Operation<Fact> | HintedObject} [operation] - The operation to be signed.
     * @param {SignOption} [option] - (Optional) Option for node sign.
     * @returns The signed operation in JSON object (HintedObject).
     */
    sign(privatekey, operation, option) {
        Assert.check(isOpFact(operation) || isHintedObject(operation), MitumError.detail(ECODE.INVALID_OPERATION, `input is neither in OP<Fact> nor HintedObject format`));
        operation = isOpFact(operation) ? operation.toHintedObject() : operation;
        Key.from(privatekey);
        const keypair = KeyPair.fromPrivateKey(privatekey);
        return option ? this.nodeSign(keypair, operation, option.node ?? "") : this.accSign(keypair, operation);
    }
    accSign(keypair, operation) {
        const now = TimeStamp$1.new();
        const fs = new GeneralFactSign(keypair.publicKey.toString(), keypair.sign(Buffer.concat([
            Buffer.from(this.networkID),
            base58.decode(operation.fact.hash),
            now.toBuffer(),
        ])), now.toString()).toHintedObject();
        if (operation.signs !== undefined) {
            operation.signs = [...operation.signs, fs];
        }
        else {
            operation.signs = [fs];
        }
        Assert.check(new Set(operation.signs.map(fs => fs.signer.toString())).size === operation.signs.length, MitumError.detail(ECODE.INVALID_FACTSIGNS, "duplicate signers found in factsigns"));
        const factSigns = operation.signs
            .map((s) => Buffer.concat([
            Buffer.from(s.signer),
            base58.decode(s.signature),
            new FullTimeStamp(s.signed_at).toBuffer("super"),
        ]));
        //.sort((a, b) => Buffer.compare(a, b))
        const msg = Buffer.concat([
            base58.decode(operation.fact.hash),
            Buffer.concat(factSigns),
        ]);
        if (isHintedObjectFromUserOp(operation)) {
            return this.FillUserOpHash(operation);
        }
        operation.hash = base58.encode(sha3(msg));
        return operation;
    }
    nodeSign(keypair, operation, node) {
        const nd = new NodeAddress(node);
        const now = TimeStamp$1.new();
        const fs = new NodeFactSign(node, keypair.publicKey.toString(), keypair.sign(Buffer.concat([
            Buffer.from(this.networkID),
            nd.toBuffer(),
            base58.decode(operation.fact.hash),
            now.toBuffer(),
        ])), now.toString()).toHintedObject();
        if (operation.signs) {
            operation.signs = [...operation.signs, fs];
        }
        else {
            operation.signs = [fs];
        }
        const factSigns = operation.signs
            .map((s) => Buffer.concat([
            Buffer.from(s.signer),
            base58.decode(s.signature),
            new FullTimeStamp(s.signed_at).toBuffer("super"),
        ]))
            .sort((a, b) => Buffer.compare(a, b));
        const msg = Buffer.concat([
            base58.decode(operation.fact.hash),
            Buffer.concat(factSigns),
        ]);
        operation.hash = base58.encode(sha3(msg));
        return operation;
    }
    FillUserOpHash(userOperation) {
        const { extension } = userOperation;
        const { authentication, settlement, proxy_payer } = extension;
        this.validateUserOpFields({ ...authentication, ...settlement, ...proxy_payer });
        const hintedExtension = (() => {
            const auth = new Authentication(authentication.contract, authentication.authentication_id, authentication.proof_data).toHintedObject();
            const settlementObj = new Settlement(settlement.op_sender).toHintedObject();
            if (proxy_payer) {
                const proxyPayerObj = new ProxyPayer(proxy_payer.proxy_payer).toHintedObject();
                return { authentication: auth, proxy_payer: proxyPayerObj, settlement: settlementObj };
            }
            return { authentication: auth, settlement: settlementObj };
        })();
        const msg = Buffer.concat([
            Buffer.from(JSON.stringify(hintedExtension)),
            base58.decode(userOperation.fact.hash),
            Buffer.concat(userOperation.signs.map((s) => Buffer.concat([
                Buffer.from(s.signer),
                base58.decode(s.signature),
                new FullTimeStamp(s.signed_at).toBuffer("super"),
            ]))),
        ]);
        userOperation.hash = base58.encode(sha3(msg));
        return userOperation;
    }
    validateUserOpFields(fields) {
        Object.entries(fields).forEach(([key, value]) => {
            if (value !== undefined) {
                StringAssert.with(value, MitumError.detail(ECODE.INVALID_USER_OPERATION, `Cannot sign the user operation: ${key} must not be empty.`)).empty().not().excute();
            }
        });
    }
}

class Operation extends Generator {
    constructor(networkID, api, delegateIP) {
        super(networkID, api, delegateIP);
    }
    /**
     * Get all operations of the network.
     * @async
     * @param {number} [limit] - (Optional) The maximum number of items to retrieve.
     * @param {number} [offset] - (Optional) The number of items skip before starting to return data.
     * @param {boolean} [reverse] - (Optional) Whether to return the items in reverse newest order.
     * @returns The `data` of `SuccessResponse` represents an array of all operations in the network:
     * - `_hint`: Indicates mitum engine version,
     * - `_embedded`:
     * - - `_hint`: Hint for the operation,
     * - - `hash`: Hash for the fact,
     * - - `operation`: Information of the operation includes `hash`, `fact`, `signs`, `_hint`,
     * - - `height`: Block height containing the operation,
     * - - `confirmed_at`: Timestamp when the block was confirmed,
     * - - `reason`: Reason for operation failure,
     * - - `in_state`: Boolean indicating whether the operation was successful or not,
     * - - `index`: Index of the operation in the block
     * - `_links`: Links to get additional information
     */
    async getAllOperations(limit, offset, reverse) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        return await getAPIData(() => api$1.getOperations(this.api, this.delegateIP, limit, offset, reverse));
    }
    /**
     * Get a operation by fact hash.
     * @async
     * @param {string} [hash] - The hash value of the fact included in the operation to retrieve
     * @returns The `data` of `SuccessResponse` is *null* or infomation of the operation:
     * - `_hint`: Hint for the operation,
     * - `hash`: Hash for the fact,
     * - `operation`:
     * - - `hash`: Hash fot the operation,
     * - - `fact`: Object for fact,
     * - - `signs`: Array for sign,
     * - - `_hint`: Hint for operation type,
     * - `height`: Block height containing the operation,
     * - `confirmed_at`: Timestamp when the block was confirmed,
     * - `reason`: Reason for operation failure,
     * - `in_state`: Boolean indicating whether the operation was successful or not,
     * - `index`: Index of the operation in the block
     *
     * ***null* means that the account has not yet been recorded in the block.**
     */
    async getOperation(hash) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        const response = await getAPIData(() => api$1.getOperation(this.api, hash, this.delegateIP));
        if (isSuccessResponse(response)) {
            response.data = response.data ? response.data : null;
        }
        return response;
    }
    /**
     * Get multiple operations by array of fact hashes.
     * Returns excluding operations that have not yet been recorded.
     * @async
     * @param {string[]} [hashes] - Array of fact hashes, fact hash must be base58 encoded string with 43 or 44 length.
     * @returns The `data` of `SuccessResponse` is array of infomation of the operations:
     * - `_hint`: Hint for the operation,
     * - `hash`: Hash for the fact,
     * - `operation`:
     * - - `hash`: Hash fot the operation,
     * - - `fact`: Object for fact,
     * - - `signs`: Array for sign,
     * - - `_hint`: Hint for operation type,
     * - `height`: Block height containing the operation,
     * - `confirmed_at`: Timestamp when the block was confirmed,
     * - `reason`: Reason for operation failure,
     * - `in_state`: Boolean indicating whether the operation was successful or not,
     * - `index`: Index of the operation in the block
     */
    async getMultiOperations(hashes) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        ArrayAssert.check(hashes, "hashes")
            .noDuplicates()
            .rangeLength(Config.FACT_HASHES);
        hashes.forEach((hash) => {
            Assert.check(isBase58Encoded(hash) && (hash.length === 44 || hash.length === 43), MitumError.detail(ECODE.INVALID_FACT_HASH, "fact hash must be base58 encoded string with 44 or 43 length."));
        });
        const response = await getAPIData(() => api$1.getMultiOperations(this.api, hashes, this.delegateIP));
        if (isSuccessResponse(response) && Array.isArray(response.data)) {
            response.data = response.data.map((el) => { return el._embedded; });
        }
        return response;
    }
    /**
     * Sign the given operation using the provided private key or key pair.
     * @param {string | Key | KeyPair} [privatekey] - The private key or key pair for signing.
     * @param {OP<Fact>} [operation] - The operation to sign.
     * @param {SignOption} [option] - (Optional) Option for node sign.
     * @returns The signed operation.
     */
    sign(privatekey, operation, option) {
        const op = operation;
        op.sign(privatekey instanceof KeyPair ? privatekey.privateKey : privatekey, option);
        return op;
    }
    /**
     * Send the given singed operation to blockchain network.
     * @async
     * @param { Operation<Fact> | HintedObject} [operation] - The operation to send.
     * @param {{[i: string]: any} | undefined} [headers] - (Optional) Additional headers for the request.
     * @returns Properties of `OperationResponse`:
     * - response: <SuccessResponse | ErrorResponse>
     * - _api: API URL
     * - _delegateIP: IP address for delegation
     * @example
     * // Send operation and check response and receipt:
     * const sendOperation = async () => {
     *   const data = await mitum.operation.send(signedOperation);
     *   console.log(data.response);
     *   const receipt = await data.wait();
     *   console.log(receipt);
     * };
     * sendOperation();
     */
    async send(operation, headers) {
        Assert.check(this.api !== undefined && this.api !== null, MitumError.detail(ECODE.NO_API, "API is not provided"));
        Assert.check(isOpFact(operation) || isHintedObject(operation), MitumError.detail(ECODE.INVALID_OPERATION, `input is neither in OP<Fact> nor HintedObject format`));
        operation = isOpFact(operation) ? operation.toHintedObject() : operation;
        Assert.check(operation.signs.length !== 0, MitumError.detail(ECODE.EMPTY_SIGN, `signature is required before sending the operation`));
        Assert.check(Config.OP_SIZE.satisfy(Buffer.byteLength(JSON.stringify(operation), 'utf8')), MitumError.detail(ECODE.OP_SIZE_EXCEEDED, `Operation size exceeds the allowed limit of ${Config.OP_SIZE.max} bytes.`));
        const sendResponse = await getAPIData(() => api$1.send(this.api, operation, this.delegateIP, headers));
        return new OperationResponse(sendResponse, this.networkID, this.api, this.delegateIP);
    }
}
class OperationResponse extends Operation {
    constructor(response, networkID, api, delegateIP) {
        super(networkID, api, delegateIP);
        this.response = response;
    }
    /**
     * Get receipt when a sent operation is recorded in a block by polling the blockchain network for a certain time.
     * @async
     * @param {number | undefined} [timeout=10000] - (Optional) Timeout for polling in milliseconds. Default is 10000ms.
     * @param {number | undefined} [interval=1000] - (Optional) Interval for polling in milliseconds. Default is 1000ms. (interval < timeout)
     * @returns The `data` property of `SuccessResponse` contains information about the operation:
     * - `_hint`: Hint for the operation,
     * - `hash`: Hash for the fact,
     * - `operation`:
     * - - `hash`: Hash fot the operation,
     * - - `fact`: Object for fact,
     * - - `signs`: Array for sign,
     * - - `_hint`: Hint for operation type,
     * - `height`: Block height containing the operation,
     * - `confirmed_at`: Timestamp when the block was confirmed,
     * - `reason`: Reason for operation failure,
     * - `in_state`: Boolean indicating whether the operation was successful or not,
     * - `index`: Index of the operation in the block
     *
     * **If `in_state` is `false`, the operation failed, and the `reason` property provides the failure reason.**
     */
    async wait(timeout, interval) {
        Assert.check(this.response.status === 200, MitumError.detail(ECODE.TRANSACTION_REVERTED, `transaction reverted by the network, check error message`));
        let elapsedTime = 0;
        const maxTimeout = timeout ?? 10000;
        const timeoutInterval = interval ?? 1000;
        const validatePositiveInteger = (val, name) => {
            if (!Number.isSafeInteger(val) || val <= 0) {
                throw MitumError.detail(ECODE.INVALID_FLOAT, `${name} must be a positive integer`);
            }
        };
        validatePositiveInteger(maxTimeout, "timeout");
        validatePositiveInteger(timeoutInterval, "interval");
        if (maxTimeout <= timeoutInterval) {
            if (interval === undefined) {
                throw MitumError.detail(ECODE.INVALID_FLOAT, "default interval is 1000, so timeout must be greater than that.");
            }
            else if (timeout === undefined) {
                throw MitumError.detail(ECODE.INVALID_FLOAT, "default timeout is 10000, so interval must be less than that.");
            }
            else {
                throw MitumError.detail(ECODE.INVALID_FLOAT, "timeout must be larger than interval.");
            }
        }
        let stop = false;
        while (!stop && elapsedTime < maxTimeout) {
            try {
                const receipt = await this.getOperation(this.response.data.fact.hash);
                if (isSuccessResponse(receipt) && receipt.data !== undefined && receipt.data !== null) {
                    if (receipt.data.in_state) {
                        console.log('\x1b[34m%s\x1b[0m', `operation in_state is true. fact hash: ${this.response.data.fact.hash}`);
                        return receipt;
                    }
                    else {
                        console.log('\x1b[31m%s\x1b[0m', `operation in_state is false. fact hash: ${this.response.data.fact.hash}, reason: ${receipt.data.reason}`);
                        return receipt;
                    }
                }
                else {
                    console.log('\x1b[33m%s\x1b[0m', `polling for ${elapsedTime} ms, fact hash: ${this.response.data.fact.hash}`);
                }
            }
            catch (error) {
                stop = true;
                throw (error);
            }
            elapsedTime += timeoutInterval;
            await new Promise(resolve => setTimeout(resolve, timeoutInterval));
        }
        Assert.check(stop, MitumError.detail(ECODE.TIME_OUT, `timeout reached (${maxTimeout / 1000} seconds).`));
    }
}

class Mitum extends Generator {
    constructor(api, delegateIP) {
        super(NetworkID.get(), api, delegateIP);
        this._node = new Node(this.api, this.delegateIP);
        this._account = new Account(this.networkID, this.api, this.delegateIP);
        this._currency = new Currency(this.networkID, this.api, this.delegateIP);
        this._block = new Block(this.api, this.delegateIP);
        this._operation = new Operation(this.networkID, this.api, this.delegateIP);
        this._signer = new Signer(this.networkID, this.api);
        this._contract = new Contract(this.networkID, this.api, this.delegateIP);
        this._nft = new NFT(this.networkID, this.api, this.delegateIP);
        this._credential = new Credential(this.networkID, this.api, this.delegateIP);
        this._timestamp = new TimeStamp(this.networkID, this.api, this.delegateIP);
        this._sto = new STO(this.networkID, this.api, this.delegateIP);
        this._kyc = new KYC(this.networkID, this.api, this.delegateIP);
        this._dao = new DAO(this.networkID, this.api, this.delegateIP);
        this._token = new Token(this.networkID, this.api, this.delegateIP);
        this._point = new Point(this.networkID, this.api, this.delegateIP);
        this._storage = new Storage(this.networkID, this.api, this.delegateIP);
        this._payment = new Payment(this.networkID, this.api, this.delegateIP);
        this.ECODE = ECODE;
        this.PCODE = PCODE;
        this.DCODE = DCODE;
        this._utils = new Utils();
    }
    refresh() {
        this._node = new Node(this.api, this.delegateIP);
        this._account = new Account(this.networkID, this.api, this.delegateIP);
        this._currency = new Currency(this.networkID, this.api, this.delegateIP);
        this._block = new Block(this.api, this.delegateIP);
        this._operation = new Operation(this.networkID, this.api, this.delegateIP);
        this._contract = new Contract(this.networkID, this.api, this.delegateIP);
        this._nft = new NFT(this.networkID, this.api, this.delegateIP);
        this._credential = new Credential(this.networkID, this.api, this.delegateIP);
        this._timestamp = new TimeStamp(this.networkID, this.api, this.delegateIP);
        this._sto = new STO(this.networkID, this.api, this.delegateIP);
        this._kyc = new KYC(this.networkID, this.api, this.delegateIP);
        this._dao = new DAO(this.networkID, this.api, this.delegateIP);
        this._token = new Token(this.networkID, this.api, this.delegateIP);
        this._point = new Point(this.networkID, this.api, this.delegateIP);
        this._storage = new Storage(this.networkID, this.api, this.delegateIP);
        this._payment = new Payment(this.networkID, this.api, this.delegateIP);
        this._utils = new Utils();
    }
    get node() {
        return this._node;
    }
    get account() {
        return this._account;
    }
    get currency() {
        return this._currency;
    }
    get block() {
        return this._block;
    }
    get operation() {
        return this._operation;
    }
    get signer() {
        return this._signer;
    }
    get contract() {
        return this._contract;
    }
    get nft() {
        return this._nft;
    }
    get credential() {
        return this._credential;
    }
    get timestamp() {
        return this._timestamp;
    }
    get sto() {
        return this._sto;
    }
    get kyc() {
        return this._kyc;
    }
    get dao() {
        return this._dao;
    }
    get token() {
        return this._token;
    }
    get point() {
        return this._point;
    }
    get storage() {
        return this._storage;
    }
    get payment() {
        return this._payment;
    }
    get utils() {
        return this._utils;
    }
    /**
     * Set the API URL to interact with Mitum network.
     * @param {string | IP} [api] - The API URL to set
     */
    setAPI(api) {
        super.setAPI(api);
        this.refresh();
    }
    /**
     * Set the delegate IP address.
     * @param {string | IP} [delegateIP] - The delegate IP address to set.
     */
    setDelegate(delegateIP) {
        super.setDelegate(delegateIP);
        this.refresh();
    }
    /**
     * Set the blockchain network ID (chain). The default value is configured to 'mitum'.
     * @param {string} [networkID] - The network ID to set.
     */
    setNetworkID(networkID) {
        super.setNetworkID(networkID);
        this.refresh();
    }
    /**Get the API URL in use.
     * @returns {string | undefined} The API URL.
    */
    getAPI() {
        return this.api ? this.api.toString() : undefined;
    }
    /**
     * Get the delegate IP in use.
     * @returns {string} The delegate IP address.
     */
    getDelegate() {
        return this.delegateIP ? this.delegateIP.toString() : undefined;
    }
    /**Get the network ID in use.
     * @returns {string} The network ID (chain).
    */
    getNetworkID() {
        return this.networkID;
    }
}

exports.Mitum = Mitum;
exports.default = Mitum;
