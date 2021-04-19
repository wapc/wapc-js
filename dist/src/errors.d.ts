declare class TestableError extends Error {
    matcher(): RegExp;
}
export declare class HostCallNotImplementedError extends TestableError {
    constructor(binding: string, namespace: string, operation: string);
}
export declare class InvalidWasm extends TestableError {
    constructor(error: Error);
}
export declare class StreamingFailure extends TestableError {
    constructor(error: Error);
}
export {};
