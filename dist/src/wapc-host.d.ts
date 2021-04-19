declare type HostCall = (binding: string, namespace: string, operation: string, payload: Uint8Array) => Uint8Array;
interface Invocation {
    operation: string;
    msg: Uint8Array;
}
declare class ModuleState {
    guestRequest?: Invocation;
    guestResponse?: Uint8Array;
    hostResponse?: Uint8Array;
    guestError?: string;
    hostError?: string;
    hostCallback: HostCall;
    constructor(hostCall?: HostCall);
}
export declare class WapcHost {
    buffer: Uint8Array;
    instance: WebAssembly.Instance;
    state: ModuleState;
    constructor(hostCall?: HostCall);
    instantiate(source: Uint8Array): Promise<WapcHost>;
    instantiateStreaming(source: Response): Promise<WapcHost>;
    invoke(operation: string, payload: Uint8Array): Promise<Uint8Array>;
    getCallerMemory(): WebAssembly.Memory;
}
export declare function instantiate(source: Uint8Array, hostCall?: HostCall): Promise<WapcHost>;
export declare function instantiateStreaming(source: Response | Promise<Response>, hostCall?: HostCall): Promise<WapcHost>;
export {};
