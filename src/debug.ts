import DEBUG from 'debug';
const _debug = DEBUG('wapc');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debug(cb: () => [string, ...any]): void {
  if (_debug.enabled) {
    const params = cb();
    _debug(...params);
  }
}
