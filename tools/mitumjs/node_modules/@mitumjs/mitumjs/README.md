## Abstraction
- __mitum.js__ is the framework of the mitum blockchain written in the typescript language and provided in esm, cjs builded form.
- The Mitum blockchain operates on a __multi-sig account__ basis. However, for user convenience, __single-sig__ is prioritized.
- Name the method so that it can be called intuitively from the user's perspective.
- For consistency, method names use camel notation.
- To eliminate confusion about the singular/plural representation of method names, we unify the singular notation.
    
    The exception is when there are more than one method with the same function and the return value is singular and plural.
    
</br> 

</br> 

## **Install**    
- Both commonjs (cjs) and ES2020 (esm) are available.
- For ESM, the runtime environment is detected automatically: XMLHttpRequests are supported in the browser, and HTTP requests are supported in Node.js.
This project has been developed in the following environments:
* node version <code>>=</code> 16
* npm version <code>>=</code> 8

Check your node, npm version
```bash
$ node --version
$ npm --version
```

You can install this package locally using this command:

```bash
$ npm i @mitumjs/mitumjs
```

</br> 

</br> 

## Usage
- Use the cjs module or esm module as described below.

- This is an example of how to 'require' a CJS module.
    
    Enter an RPC-URL to communicate with the node.
    
    You can omit the RPC-URL if you don't need to communicate with the node (for example, to generate a simple key pair or an operation for signing).
    
    You can set the RPC-URL as shown below.

```jsx
// test.cjs
const { Mitum } = require("@mitumjs/mitumjs");

const mitum = new Mitum("http://127.0.0.1:54320");

const keys = mitum.account.etherKeys(2);
console.log(keys);
```

- This is an example of how to 'import' a ESM module.

```jsx
// test.mjs
import Mitum from '@mitumjs/mitumjs';

const mitum = new Mitum("http://127.0.0.1:54320");

const keys = mitum.account.etherKeys(2);
console.log(keys);
```

> **⚠️ Note**
> 
> If you want to specify whether to use CommonJS or ESM in your package, add the following entry in the <code>package.json</code> : </br>
> <code>"type": "commonjs"</code> or <code>"type": "module"</code>. <br>
> Also, consider explicitly specifying the file extension as <code>.cjs</code> or <code>.mjs</code> rather than <code>.js</code> in the execution file.</br>

</br>

</br> 

## Functions

**Important note** **about using functions :**

The operation of Mitum is a transaction ‘message’.

Thus if function returns an operation object, remember that you **haven't sent an operation to the network.**

Any operation returned by the function is a raw transaction object, which **requires additional signing.**

Signed operation object must be **sent to the network via the operation.send() function.**
(This is similar to web3.js and ethers.js).

</br> 

## Mitum JS SDK user guide

Futher etailed information on how to use each function and the contract model can be found at the link below.

*Be sure to check it out before using SDK.* 

<a href="https://socialinfratech.gitbook.io/mitum-js-sdk/introduction/installation"> 📖 Mitum JS SDK user guide </a>