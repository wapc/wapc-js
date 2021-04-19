"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamingFailure = exports.InvalidWasm = exports.HostCallNotImplementedError = void 0;
class TestableError extends Error {
    matcher() {
        return new RegExp(this.toString().replace(/^Error: /, ''));
    }
}
class HostCallNotImplementedError extends TestableError {
    constructor(binding, namespace, operation) {
        super(`Host call not implemented. Guest called host with binding = '${binding}', namespace = '${namespace}', & operation = '${operation}'`);
    }
}
exports.HostCallNotImplementedError = HostCallNotImplementedError;
class InvalidWasm extends TestableError {
    constructor(error) {
        super(`Invalid wasm binary: ${error.message}`);
    }
}
exports.InvalidWasm = InvalidWasm;
class StreamingFailure extends TestableError {
    constructor(error) {
        super(`Could not instantiate from Response object: ${error.message}`);
    }
}
exports.StreamingFailure = StreamingFailure;
//# sourceMappingURL=errors.js.map