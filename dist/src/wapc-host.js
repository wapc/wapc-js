"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.instantiateStreaming = exports.instantiate = exports.WapcHost = void 0;
const debug_1 = __importDefault(require("debug"));
const _1 = require(".");
const callbacks_1 = require("./callbacks");
const errors_1 = require("./errors");
const debug = debug_1.default('wapc-node');
const START = '_start'; // Linux/TinyGo initialization
const WAPC_INIT = 'wapc_init';
const GUEST_CALL = '__guest_call';
class ModuleState {
    constructor(hostCall, writer) {
        this.hostCallback =
            hostCall ||
                ((binding, namespace, operation) => {
                    throw new errors_1.HostCallNotImplementedError(binding, namespace, operation);
                });
        this.writer = writer || (() => undefined);
    }
}
class WapcHost {
    constructor(hostCall, writer) {
        this.state = new ModuleState(hostCall, writer);
        this.textEncoder = new TextEncoder();
        this.textDecoder = new TextDecoder('utf-8');
        this.guestCall = () => undefined;
    }
    async instantiate(source) {
        const imports = this.getImports();
        const result = await WebAssembly.instantiate(source, imports).catch(e => {
            throw new _1.errors.InvalidWasm(e);
        });
        this.initialize(result.instance);
        return this;
    }
    async instantiateStreaming(source) {
        const imports = this.getImports();
        const result = await WebAssembly.instantiateStreaming(source, imports).catch(e => {
            throw new _1.errors.StreamingFailure(e);
        });
        this.initialize(result.instance);
        return this;
    }
    getImports() {
        const wasiImports = callbacks_1.generateWASIImports(this);
        return {
            wapc: callbacks_1.generateWapcImports(this),
            wasi: wasiImports,
            wasi_unstable: wasiImports,
        };
    }
    initialize(instance) {
        this.instance = instance;
        const start = this.instance.exports[START];
        if (start != null) {
            start([]);
        }
        const init = this.instance.exports[WAPC_INIT];
        if (init != null) {
            init([]);
        }
        this.guestCall = this.instance.exports[GUEST_CALL];
        if (this.guestCall == null) {
            throw new Error('WebAssembly module does not export __guest_call');
        }
    }
    async invoke(operation, payload) {
        debug(`invoke(%o, [%o bytes]`, operation, payload.length);
        const operationEncoded = this.textEncoder.encode(operation);
        this.state.guestRequest = { operation, operationEncoded, msg: payload };
        const result = this.guestCall(operationEncoded.length, payload.length);
        if (result === 0) {
            throw new Error(this.state.guestError);
        }
        else {
            if (!this.state.guestResponse) {
                throw new Error('Guest call succeeded, but guest response not set. This is a bug in wapc-node');
            }
            else {
                return this.state.guestResponse;
            }
        }
    }
    getCallerMemory() {
        return this.instance.exports.memory;
    }
}
exports.WapcHost = WapcHost;
async function instantiate(source, hostCall, writer) {
    const host = new WapcHost(hostCall, writer);
    return host.instantiate(source);
}
exports.instantiate = instantiate;
async function instantiateStreaming(source, hostCall, writer) {
    const host = new WapcHost(hostCall, writer);
    return host.instantiateStreaming(await source);
}
exports.instantiateStreaming = instantiateStreaming;
//# sourceMappingURL=wapc-host.js.map