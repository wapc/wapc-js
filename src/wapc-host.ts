import DEBUG from 'debug';
import { errors } from '.';
import { generate_wapc_imports as generateWapcImports } from './callbacks';
import { HostCallNotImplementedError } from './errors';

const debug = DEBUG('wapc-node');

type HostCall = (binding: string, namespace: string, operation: string, payload: Uint8Array) => Uint8Array;

interface Invocation {
  operation: string;
  msg: Uint8Array;
}

const WAPC_INIT = 'wapc_init';
const GUEST_CALL = '__guest_call';

class ModuleState {
  guestRequest?: Invocation;
  guestResponse?: Uint8Array;
  hostResponse?: Uint8Array;
  guestError?: string;
  hostError?: string;
  hostCallback: HostCall;
  constructor(hostCall?: HostCall) {
    this.hostCallback =
      hostCall ||
      ((binding, namespace, operation) => {
        throw new HostCallNotImplementedError(binding, namespace, operation);
      });
  }
}

const ENCODER = new TextEncoder();

export class WapcHost {
  buffer!: Uint8Array;
  instance!: WebAssembly.Instance;
  state: ModuleState;
  constructor(hostCall?: HostCall) {
    this.state = new ModuleState(hostCall);
  }
  async instantiate(source: Uint8Array): Promise<WapcHost> {
    const imports = {
      wapc: generateWapcImports(this),
    };
    const result = await WebAssembly.instantiate(source, imports).catch(e => {
      throw new errors.InvalidWasm(e);
    });
    this.instance = result.instance;
    const init = this.instance.exports[WAPC_INIT] as CallableFunction;
    init([]);
    return this;
  }
  async instantiateStreaming(source: Response): Promise<WapcHost> {
    const imports = {
      wapc: generateWapcImports(this),
    };
    const result = await WebAssembly.instantiateStreaming(source, imports).catch(e => {
      throw new errors.StreamingFailure(e);
    });
    this.instance = result.instance;
    const init = this.instance.exports[WAPC_INIT] as CallableFunction;
    init([]);
    return this;
  }
  async invoke(operation: string, payload: Uint8Array): Promise<Uint8Array> {
    debug(`invoke(%o, [%o bytes]`, operation, payload.length);
    this.state.guestRequest = { operation, msg: payload };
    const guestCall = this.instance.exports[GUEST_CALL] as CallableFunction;
    const result = guestCall(ENCODER.encode(operation).length, payload.length);
    if (result === 0) {
      throw new Error(this.state.guestError);
    } else {
      if (!this.state.guestResponse) {
        throw new Error('Guest call succeeded, but guest response not set. This is a bug in wapc-node');
      } else {
        return this.state.guestResponse;
      }
    }
  }
  getCallerMemory(): WebAssembly.Memory {
    const mem = this.instance.exports.memory as WebAssembly.Memory;
    return mem;
  }
}

export async function instantiate(source: Uint8Array, hostCall?: HostCall): Promise<WapcHost> {
  const host = new WapcHost(hostCall);
  return host.instantiate(source);
}

export async function instantiateStreaming(
  source: Response | Promise<Response>,
  hostCall?: HostCall,
): Promise<WapcHost> {
  const host = new WapcHost(hostCall);
  return host.instantiateStreaming(await source);
}
