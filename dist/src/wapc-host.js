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
const WAPC_INIT = 'wapc_init';
const GUEST_CALL = '__guest_call';
class ModuleState {
    constructor(hostCall) {
        this.hostCallback =
            hostCall ||
                ((binding, namespace, operation) => {
                    throw new errors_1.HostCallNotImplementedError(binding, namespace, operation);
                });
    }
}
const ENCODER = new TextEncoder();
class WapcHost {
    constructor(hostCall) {
        this.state = new ModuleState(hostCall);
    }
    async instantiate(source) {
        const imports = {
            wapc: callbacks_1.generate_wapc_imports(this),
        };
        const result = await WebAssembly.instantiate(source, imports).catch(e => {
            throw new _1.errors.InvalidWasm(e);
        });
        this.instance = result.instance;
        const init = this.instance.exports[WAPC_INIT];
        init([]);
        return this;
    }
    async instantiateStreaming(source) {
        const imports = {
            wapc: callbacks_1.generate_wapc_imports(this),
        };
        const result = await WebAssembly.instantiateStreaming(source, imports).catch(e => {
            throw new _1.errors.StreamingFailure(e);
        });
        this.instance = result.instance;
        const init = this.instance.exports[WAPC_INIT];
        init([]);
        return this;
    }
    async invoke(operation, payload) {
        debug(`invoke(%o, [%o bytes]`, operation, payload.length);
        this.state.guestRequest = { operation, msg: payload };
        const guestCall = this.instance.exports[GUEST_CALL];
        const result = guestCall(ENCODER.encode(operation).length, payload.length);
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
        const mem = this.instance.exports.memory;
        return mem;
    }
}
exports.WapcHost = WapcHost;
async function instantiate(source, hostCall) {
    const host = new WapcHost(hostCall);
    return host.instantiate(source);
}
exports.instantiate = instantiate;
async function instantiateStreaming(source, hostCall) {
    const host = new WapcHost(hostCall);
    return host.instantiateStreaming(await source);
}
exports.instantiateStreaming = instantiateStreaming;
//# sourceMappingURL=wapc-host.js.map