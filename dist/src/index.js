"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors = exports.WapcHost = exports.instantiateStreaming = exports.instantiate = void 0;
var wapc_host_1 = require("./wapc-host");
Object.defineProperty(exports, "instantiate", { enumerable: true, get: function () { return wapc_host_1.instantiate; } });
Object.defineProperty(exports, "instantiateStreaming", { enumerable: true, get: function () { return wapc_host_1.instantiateStreaming; } });
Object.defineProperty(exports, "WapcHost", { enumerable: true, get: function () { return wapc_host_1.WapcHost; } });
exports.errors = __importStar(require("./errors"));
//# sourceMappingURL=index.js.map