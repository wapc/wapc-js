import DEBUG from 'debug';
import { WapcProtocol } from './protocol';
import { WapcHost } from './wapc-host';

const debug = DEBUG('wapc-node');

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder('utf-8');

export function generate_wapc_imports(instance: WapcHost): WapcProtocol & WebAssembly.ModuleImports {
  return {
    __console_log(ptr: number, len: number) {
      debug('__console_log %o bytes @ %o', len, ptr);
      const str_bytes = getVecFromMemory(instance.getCallerMemory(), ptr, len);
      console.log(DECODER.decode(str_bytes));
    },
    __host_call(
      bd_ptr: number,
      bd_len: number,
      ns_ptr: number,
      ns_len: number,
      op_ptr: number,
      op_len: number,
      ptr: number,
      len: number,
    ): number {
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
      } catch (e) {
        instance.state.hostError = e.toString();
        return 0;
      }
    },
    __host_response(ptr: number) {
      debug('__host_response ptr: %o', ptr);
      if (instance.state.hostResponse) {
        writeBytesToMemory(instance.getCallerMemory(), ptr, instance.state.hostResponse);
      }
    },
    __host_response_len(): number {
      const len = instance.state.hostResponse?.length || 0;
      debug('__host_response_len %o', len);
      return len;
    },
    __host_error_len(): number {
      const len = instance.state.hostError?.length || 0;
      debug('__host_error_len ptr: %o', len);
      return len;
    },
    __host_error(ptr: number) {
      debug('__host_error %o', ptr);
      if (instance.state.hostError) {
        debug('__host_error writing to mem: %o', instance.state.hostError);
        writeBytesToMemory(instance.getCallerMemory(), ptr, ENCODER.encode(instance.state.hostError));
      }
    },
    __guest_response(ptr: number, len: number) {
      debug('__guest_response %o bytes @ %o', len, ptr);
      const bytes = getVecFromMemory(instance.getCallerMemory(), ptr, len);
      instance.state.guestResponse = bytes;
    },
    __guest_error(ptr: number, len: number) {
      debug('__guest_error %o bytes @ %o', len, ptr);
      instance.state.guestError = getStringFromMemory(instance.getCallerMemory(), ptr, len);
    },
    __guest_request(op_ptr: number, ptr: number) {
      debug('__guest_request op: %o, ptr: %o', op_ptr, ptr);
      const invocation = instance.state.guestRequest;
      if (invocation) {
        const memory = instance.getCallerMemory();
        debug('writing invocation (%o,[%o bytes])', invocation.operation, invocation.msg.length);
        writeBytesToMemory(memory, ptr, invocation.msg);
        writeBytesToMemory(memory, op_ptr, ENCODER.encode(invocation.operation));
      } else {
        throw new Error(
          '__guest_request called without an invocation present. This is probably a bug in the implementing library.',
        );
      }
    },
  };
}

function getStringFromMemory(memory: WebAssembly.Memory, ptr: number, len: number): string {
  const str_bytes = getVecFromMemory(memory, ptr, len);
  return DECODER.decode(str_bytes);
}

function getVecFromMemory(memory: WebAssembly.Memory, ptr: number, len: number): Uint8Array {
  const buffer = new Uint8Array(memory.buffer);
  return buffer.slice(ptr, ptr + len);
}

function writeBytesToMemory(memory: WebAssembly.Memory, ptr: number, slice: Uint8Array): void {
  debug(`writing to mem [%o bytes] @ %o`, slice.length, ptr);
  const buffer = new Uint8Array(memory.buffer);
  buffer.set(slice, ptr);
}
