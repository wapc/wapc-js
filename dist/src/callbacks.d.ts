import { WapcProtocol } from './protocol';
import { WapcHost } from './wapc-host';
export declare function generate_wapc_imports(instance: WapcHost): WapcProtocol & WebAssembly.ModuleImports;
