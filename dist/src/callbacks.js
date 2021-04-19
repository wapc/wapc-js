"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_wapc_imports = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default('wapc-node');
const ENCODER = new TextEncoder();
const DECODER = new TextDecoder('utf-8');
function generate_wapc_imports(instance) {
    return {
        __console_log(ptr, len) {
            debug('__console_log %o bytes @ %o', len, ptr);
            const str_bytes = getVecFromMemory(instance.getCallerMemory(), ptr, len);
            console.log(DECODER.decode(str_bytes));
        },
        __host_call(bd_ptr, bd_len, ns_ptr, ns_len, op_ptr, op_len, ptr, len) {
            debug('__host_call');
            const mem = instance.getCallerMemory();
            const binding = getStringFromMemory(mem, bd_ptr, bd_len);
            const namespace = getStringFromMemory(mem, ns_ptr, ns_len);
            const operation = getStringFromMemory(mem, op_ptr, op_len);
            const bytes = getVecFromMemory(mem, ptr, len);
            debug('host_call(%o,%o,%o,[%o bytes])', binding, namespace, operation, bytes.length);
            instance.state.hostError = undefined;
            instance.state.hostResponse = undefined;
            try {
                const result = instance.state.hostCallback(binding, namespace, operation, bytes);
                instance.state.hostResponse = result;
                return 1;
            }
            catch (e) {
                instance.state.hostError = e.toString();
                return 0;
            }
        },
        __host_response(ptr) {
            debug('__host_response ptr: %o', ptr);
            if (instance.state.hostResponse) {
                writeBytesToMemory(instance.getCallerMemory(), ptr, instance.state.hostResponse);
            }
        },
        __host_response_len() {
            const len = instance.state.hostResponse?.length || 0;
            debug('__host_response_len %o', len);
            return len;
        },
        __host_error_len() {
            const len = instance.state.hostError?.length || 0;
            debug('__host_error_len ptr: %o', len);
            return len;
        },
        __host_error(ptr) {
            debug('__host_error %o', ptr);
            if (instance.state.hostError) {
                debug('__host_error writing to mem: %o', instance.state.hostError);
                writeBytesToMemory(instance.getCallerMemory(), ptr, ENCODER.encode(instance.state.hostError));
            }
        },
        __guest_response(ptr, len) {
            debug('__guest_response %o bytes @ %o', len, ptr);
            const bytes = getVecFromMemory(instance.getCallerMemory(), ptr, len);
            instance.state.guestResponse = bytes;
        },
        __guest_error(ptr, len) {
            debug('__guest_error %o bytes @ %o', len, ptr);
            instance.state.guestError = getStringFromMemory(instance.getCallerMemory(), ptr, len);
        },
        __guest_request(op_ptr, ptr) {
            debug('__guest_request op: %o, ptr: %o', op_ptr, ptr);
            const invocation = instance.state.guestRequest;
            if (invocation) {
                const memory = instance.getCallerMemory();
                debug('writing invocation (%o,[%o bytes])', invocation.operation, invocation.msg.length);
                writeBytesToMemory(memory, ptr, invocation.msg);
                writeBytesToMemory(memory, op_ptr, ENCODER.encode(invocation.operation));
            }
            else {
                throw new Error('__guest_request called without an invocation present. This is probably a bug in the implementing library.');
            }
        },
    };
}
exports.generate_wapc_imports = generate_wapc_imports;
function getStringFromMemory(memory, ptr, len) {
    const str_bytes = getVecFromMemory(memory, ptr, len);
    return DECODER.decode(str_bytes);
}
function getVecFromMemory(memory, ptr, len) {
    const buffer = new Uint8Array(memory.buffer);
    return buffer.slice(ptr, ptr + len);
}
function writeBytesToMemory(memory, ptr, slice) {
    debug(`writing to mem [%o bytes] @ %o`, slice.length, ptr);
    const buffer = new Uint8Array(memory.buffer);
    buffer.set(slice, ptr);
}
//# sourceMappingURL=callbacks.js.map