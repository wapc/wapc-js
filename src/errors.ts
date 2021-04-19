class TestableError extends Error {
  matcher() {
    return new RegExp(this.toString().replace(/^Error: /, ''));
  }
}

export class HostCallNotImplementedError extends TestableError {
  constructor(binding: string, namespace: string, operation: string) {
    super(
      `Host call not implemented. Guest called host with binding = '${binding}', namespace = '${namespace}', & operation = '${operation}'`,
    );
  }
}

export class InvalidWasm extends TestableError {
  constructor(error: Error) {
    super(`Invalid wasm binary: ${error.message}`);
  }
}

export class StreamingFailure extends TestableError {
  constructor(error: Error) {
    super(`Could not instantiate from Response object: ${error.message}`);
  }
}
