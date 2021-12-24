import { debug } from './debug';
import { errors } from '.';
import { generateWapcImports, generateWASIImports } from './callbacks';
import { HostCallNotImplementedError } from './errors';

type HostCall = (binding: string, namespace: string, operation: string, payload: Uint8Array) => Uint8Array;
type Writer = (message: string) => void;

interface Invocation {
  operation: string;
  operationEncoded: Uint8Array;
  msg: Uint8Array;
}

const START = '_start'; // Linux/TinyGo initialization
const WAPC_INIT = 'wapc_init';
const GUEST_CALL = '__guest_call';

class ModuleState {
  guestRequest?: Invocation;
  guestResponse?: Uint8Array;
  hostResponse?: Uint8Array;
  guestError?: string;
  hostError?: string;
  hostCallback: HostCall;
  writer: Writer;

  constructor(hostCall?: HostCall, writer?: Writer) {
    this.hostCallback =
      hostCall ||
      ((binding, namespace, operation) => {
        throw new HostCallNotImplementedError(binding, namespace, operation);
      });
    this.writer = writer || (() => undefined);
  }
}

export class WapcHost {
  buffer!: Uint8Array;
  instance!: WebAssembly.Instance;
  state: ModuleState;
  guestCall: CallableFunction;
  textEncoder: TextEncoder;
  textDecoder: TextDecoder;

  constructor(hostCall?: HostCall, writer?: Writer) {
    this.state = new ModuleState(hostCall, writer);
    this.textEncoder = new TextEncoder();
    this.textDecoder = new TextDecoder('utf-8');
    this.guestCall = () => undefined;
  }

  async instantiate(source: Uint8Array): Promise<WapcHost> {
    const imports = this.getImports();
    const result = await WebAssembly.instantiate(source, imports).catch(e => {
      throw new errors.InvalidWasm(e);
    });
    this.initialize(result.instance);

    return this;
  }

  async instantiateStreaming(source: Response): Promise<WapcHost> {
    const imports = this.getImports();
    if (!WebAssembly.instantiateStreaming) {
      debug(() => [
        'WebAssembly.instantiateStreaming is not supported on this browser, wasm execution will be impacted.',
      ]);
      const bytes = new Uint8Array(await (await source).arrayBuffer());
      return this.instantiate(bytes);
    } else {
      const result = await WebAssembly.instantiateStreaming(source, imports).catch(e => {
        throw new errors.StreamingFailure(e);
      });
      this.initialize(result.instance);
      return this;
    }
  }

  getImports(): WebAssembly.Imports {
    const wasiImports = generateWASIImports(this);
    return {
      wapc: generateWapcImports(this),
      wasi: wasiImports,
      wasi_unstable: wasiImports,
      wasi_snapshot_preview1: wasiImports,
    };
  }

  initialize(instance: WebAssembly.Instance): void {
    this.instance = instance;
    const start = this.instance.exports[START] as CallableFunction;
    if (start != null) {
      start([]);
    }
    const init = this.instance.exports[WAPC_INIT] as CallableFunction;
    if (init != null) {
      init([]);
    }
    this.guestCall = this.instance.exports[GUEST_CALL] as CallableFunction;
    if (this.guestCall == null) {
      throw new Error('WebAssembly module does not export __guest_call');
    }
  }

  async invoke(operation: string, payload: Uint8Array): Promise<Uint8Array> {
    debug(() => [`invoke(%o, [%o bytes]`, operation, payload.length]);
    const operationEncoded = this.textEncoder.encode(operation);
    this.state.guestRequest = { operation, operationEncoded, msg: payload };
    const result = this.guestCall(operationEncoded.length, payload.length);

    if (result === 0) {
      throw new Error(this.state.guestError);
    } else {
      if (!this.state.guestResponse) {
        throw new Error('Guest call succeeded, but guest response not set. This is a bug in @wapc/host');
      } else {
        return this.state.guestResponse;
      }
    }
  }

  getCallerMemory(): WebAssembly.Memory {
    return this.instance.exports.memory as WebAssembly.Memory;
  }
}

export async function instantiate(source: Uint8Array, hostCall?: HostCall, writer?: Writer): Promise<WapcHost> {
  const host = new WapcHost(hostCall, writer);
  return host.instantiate(source);
}

export async function instantiateStreaming(
  source: Response | Promise<Response>,
  hostCall?: HostCall,
  writer?: Writer,
): Promise<WapcHost> {
  const host = new WapcHost(hostCall, writer);
  return host.instantiateStreaming(await source);
}
