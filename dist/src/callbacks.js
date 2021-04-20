"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWASIImports = exports.generateWapcImports = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default('wapc-node');
function generateWapcImports(instance) {
    return {
        __console_log(ptr, len) {
            debug('__console_log %o bytes @ %o', len, ptr);
            const buffer = new Uint8Array(instance.getCallerMemory().buffer);
            const bytes = buffer.slice(ptr, ptr + len);
            console.log(instance.textDecoder.decode(bytes));
        },
        __host_call(bd_ptr, bd_len, ns_ptr, ns_len, op_ptr, op_len, ptr, len) {
            debug('__host_call');
            const mem = instance.getCallerMemory();
            const buffer = new Uint8Array(mem.buffer);
            const binding = instance.textDecoder.decode(buffer.slice(bd_ptr, bd_ptr + bd_len));
            const namespace = instance.textDecoder.decode(buffer.slice(ns_ptr, ns_ptr + ns_len));
            const operation = instance.textDecoder.decode(buffer.slice(op_ptr, op_ptr + op_len));
            const bytes = buffer.slice(ptr, ptr + len);
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
                const buffer = new Uint8Array(instance.getCallerMemory().buffer);
                buffer.set(instance.state.hostResponse, ptr);
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
                const buffer = new Uint8Array(instance.getCallerMemory().buffer);
                buffer.set(instance.textEncoder.encode(instance.state.hostError), ptr);
            }
        },
        __guest_response(ptr, len) {
            debug('__guest_response %o bytes @ %o', len, ptr);
            instance.state.guestError = undefined;
            const buffer = new Uint8Array(instance.getCallerMemory().buffer);
            const bytes = buffer.slice(ptr, ptr + len);
            instance.state.guestResponse = bytes;
        },
        __guest_error(ptr, len) {
            debug('__guest_error %o bytes @ %o', len, ptr);
            const buffer = new Uint8Array(instance.getCallerMemory().buffer);
            const bytes = buffer.slice(ptr, ptr + len);
            const message = instance.textDecoder.decode(bytes);
            instance.state.guestError = message;
        },
        __guest_request(op_ptr, ptr) {
            debug('__guest_request op: %o, ptr: %o', op_ptr, ptr);
            const invocation = instance.state.guestRequest;
            if (invocation) {
                const memory = instance.getCallerMemory();
                debug('writing invocation (%o,[%o bytes])', invocation.operation, invocation.msg.length);
                const buffer = new Uint8Array(memory.buffer);
                buffer.set(invocation.operationEncoded, op_ptr);
                buffer.set(invocation.msg, ptr);
            }
            else {
                throw new Error('__guest_request called without an invocation present. This is probably a bug in the implementing library.');
            }
        },
    };
}
exports.generateWapcImports = generateWapcImports;
function generateWASIImports(instance) {
    return {
        __fd_write(fileDescriptor, iovsPtr, iovsLen, writtenPtr) {
            // Only writing to standard out (1) is supported
            if (fileDescriptor != 1) {
                return 0;
            }
            const memory = instance.getCallerMemory();
            const dv = new DataView(memory.buffer);
            const heap = new Uint8Array(memory.buffer);
            let bytesWritten = 0;
            while (iovsLen > 0) {
                iovsLen--;
                const base = dv.getUint32(iovsPtr, true);
                iovsPtr += 4;
                const length = dv.getUint32(iovsPtr, true);
                iovsPtr += 4;
                const stringBytes = heap.slice(base, base + length);
                instance.state.writer(instance.textDecoder.decode(stringBytes));
                bytesWritten += length;
            }
            dv.setUint32(writtenPtr, bytesWritten, true);
            return bytesWritten;
        },
    };
}
exports.generateWASIImports = generateWASIImports;
//# sourceMappingURL=callbacks.js.map