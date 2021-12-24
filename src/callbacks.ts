import { debug } from './debug';
import { WapcProtocol } from './protocol';
import { WapcHost } from './wapc-host';

export function generateWapcImports(instance: WapcHost): WapcProtocol & WebAssembly.ModuleImports {
  return {
    __console_log(ptr: number, len: number) {
      debug(() => ['__console_log %o bytes @ %o', len, ptr]);
      const buffer = new Uint8Array(instance.getCallerMemory().buffer);
      const bytes = buffer.slice(ptr, ptr + len);
      console.log(instance.textDecoder.decode(bytes));
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
      debug(() => ['__host_call']);
      const mem = instance.getCallerMemory();
      const buffer = new Uint8Array(mem.buffer);
      const binding = instance.textDecoder.decode(buffer.slice(bd_ptr, bd_ptr + bd_len));
      const namespace = instance.textDecoder.decode(buffer.slice(ns_ptr, ns_ptr + ns_len));
      const operation = instance.textDecoder.decode(buffer.slice(op_ptr, op_ptr + op_len));
      const bytes = buffer.slice(ptr, ptr + len);
      debug(() => ['host_call(%o,%o,%o,[%o bytes])', binding, namespace, operation, bytes.length]);
      instance.state.hostError = undefined;
      instance.state.hostResponse = undefined;
      try {
        const result = instance.state.hostCallback(binding, namespace, operation, bytes);
        instance.state.hostResponse = result;
        return 1;
      } catch (e) {
        instance.state.hostError = '' + e;
        return 0;
      }
    },

    __host_response(ptr: number) {
      debug(() => ['__host_response ptr: %o', ptr]);
      if (instance.state.hostResponse) {
        const buffer = new Uint8Array(instance.getCallerMemory().buffer);
        buffer.set(instance.state.hostResponse, ptr);
      }
    },

    __host_response_len(): number {
      const len = instance.state.hostResponse?.length || 0;
      debug(() => ['__host_response_len %o', len]);
      return len;
    },

    __host_error_len(): number {
      const len = instance.state.hostError?.length || 0;
      debug(() => ['__host_error_len ptr: %o', len]);
      return len;
    },

    __host_error(ptr: number) {
      debug(() => ['__host_error %o', ptr]);
      if (instance.state.hostError) {
        debug(() => ['__host_error writing to mem: %o', instance.state.hostError]);
        const buffer = new Uint8Array(instance.getCallerMemory().buffer);
        buffer.set(instance.textEncoder.encode(instance.state.hostError), ptr);
      }
    },

    __guest_response(ptr: number, len: number) {
      debug(() => ['__guest_response %o bytes @ %o', len, ptr]);
      instance.state.guestError = undefined;
      const buffer = new Uint8Array(instance.getCallerMemory().buffer);
      const bytes = buffer.slice(ptr, ptr + len);
      instance.state.guestResponse = bytes;
    },

    __guest_error(ptr: number, len: number) {
      debug(() => ['__guest_error %o bytes @ %o', len, ptr]);
      const buffer = new Uint8Array(instance.getCallerMemory().buffer);
      const bytes = buffer.slice(ptr, ptr + len);
      const message = instance.textDecoder.decode(bytes);
      instance.state.guestError = message;
    },

    __guest_request(op_ptr: number, ptr: number) {
      debug(() => ['__guest_request op: %o, ptr: %o', op_ptr, ptr]);
      const invocation = instance.state.guestRequest;
      if (invocation) {
        const memory = instance.getCallerMemory();
        debug(() => ['writing invocation (%o,[%o bytes])', invocation.operation, invocation.msg.length]);
        const buffer = new Uint8Array(memory.buffer);
        buffer.set(invocation.operationEncoded, op_ptr);
        buffer.set(invocation.msg, ptr);
      } else {
        throw new Error(
          '__guest_request called without an invocation present. This is probably a bug in the library using @wapc/host.',
        );
      }
    },
  };
}

export function generateWASIImports(instance: WapcHost): WebAssembly.ModuleImports {
  return {
    fd_write(fileDescriptor: number, iovsPtr: number, iovsLen: number, writtenPtr: number): number {
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

    args_sizes_get(argc: number, argvBufSize: number): number {
      const memory = instance.getCallerMemory();
      const dv = new DataView(memory.buffer);

      dv.setUint32(argc, 0);
      dv.setUint32(argvBufSize, 0);

      return 0;
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    args_get(argv: number, argvBuf: number): number {
      return 0;
    },
  };
}
