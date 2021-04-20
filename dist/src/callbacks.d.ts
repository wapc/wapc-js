import { WapcProtocol } from './protocol';
import { WapcHost } from './wapc-host';
export declare function generateWapcImports(instance: WapcHost): WapcProtocol & WebAssembly.ModuleImports;
export declare function generateWASIImports(instance: WapcHost): WebAssembly.ModuleImports;
