declare type HostCall = (binding: string, namespace: string, operation: string, payload: Uint8Array) => Uint8Array;
declare type Writer = (message: string) => void;
interface Invocation {
    operation: string;
    operationEncoded: Uint8Array;
    msg: Uint8Array;
}
declare class ModuleState {
    guestRequest?: Invocation;
    guestResponse?: Uint8Array;
    hostResponse?: Uint8Array;
    guestError?: string;
    hostError?: string;
    hostCallback: HostCall;
    writer: Writer;
    constructor(hostCall?: HostCall, writer?: Writer);
}
export declare class WapcHost {
    buffer: Uint8Array;
    instance: WebAssembly.Instance;
    state: ModuleState;
    guestCall: CallableFunction;
    textEncoder: TextEncoder;
    textDecoder: TextDecoder;
    constructor(hostCall?: HostCall, writer?: Writer);
    instantiate(source: Uint8Array): Promise<WapcHost>;
    instantiateStreaming(source: Response): Promise<WapcHost>;
    getImports(): WebAssembly.Imports;
    initialize(instance: WebAssembly.Instance): void;
    invoke(operation: string, payload: Uint8Array): Promise<Uint8Array>;
    getCallerMemory(): WebAssembly.Memory;
}
export declare function instantiate(source: Uint8Array, hostCall?: HostCall, writer?: Writer): Promise<WapcHost>;
export declare function instantiateStreaming(source: Response | Promise<Response>, hostCall?: HostCall, writer?: Writer): Promise<WapcHost>;
export {};
