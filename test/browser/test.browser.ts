import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { encode, decode } from '@msgpack/msgpack';
import * as WapcJsApi from '../../src';

chai.use(chaiAsPromised);
const expect = chai.expect;

async function fetchBytes(url: string): Promise<Uint8Array> {
  return new Uint8Array(await (await (await fetch(url)).blob()).arrayBuffer());
}
const { instantiate, WapcHost, instantiateStreaming, errors } = getApiFromWindow();

describe('WapcHost', function () {
  let buffer: Uint8Array;
  beforeEach(async () => {
    buffer = await fetchBytes('/test/fixtures/rust_echo_string.wasm');
  });
  it('should create instance', async () => {
    const host = await instantiate(buffer);
    expect(host).to.be.instanceOf(WapcHost);
  });
  it('should invoke guest operation', async () => {
    const host = await instantiate(buffer);
    const payload = encode({ msg: 'hello world' });
    const result = await host.invoke('echo', payload);
    expect(result).to.be.instanceOf(Uint8Array);
    const decoded = decode(result);
    expect(decoded).to.equal('hello world');
  });
  it('guests should be able to invoke host calls', async () => {
    buffer = await fetchBytes('/test/fixtures/rust_host_call.wasm');
    const host = await instantiate(buffer, (binding, namespace, operation, payload) => {
      expect(namespace).to.equal('myNamespace');
      expect(binding).to.equal('myBinding');
      expect(operation).to.equal('myOperation');
      const decoded = decode(payload) as string;
      expect(decoded).to.equal('this is the payload');
      return new Uint8Array(encode(decoded.toUpperCase()));
    });
    const payload = encode({
      namespace: 'myNamespace',
      binding: 'myBinding',
      operation: 'myOperation',
      msg: 'this is the payload',
    });
    const result = await host.invoke('callback', payload);
    expect(result).to.be.instanceOf(Uint8Array);
    const decoded = decode(result);
    expect(decoded).to.equal('THIS IS THE PAYLOAD');
  });
  it('should throw when running guests that invoke an unimplemented host call', async () => {
    buffer = await fetchBytes('/test/fixtures/rust_host_call.wasm');
    const host = await instantiate(buffer);
    const payload = encode({
      namespace: 'ns',
      binding: 'bind',
      operation: 'op',
      msg: 'this is the payload',
    });
    await expect(host.invoke('callback', payload)).to.be.rejectedWith(
      new errors.HostCallNotImplementedError('bind', 'ns', 'op').matcher(),
    );
  });
  it('should run multiple guests', async () => {
    const host = await instantiate(buffer);
    const host2 = await instantiate(buffer);
    const result = await host.invoke('echo', encode({ msg: 'world' }));
    const decoded = decode(result);
    const result2 = await host2.invoke('echo', encode({ msg: 'world2' }));
    const decoded2 = decode(result2);
    expect(decoded).to.equal('world');
    expect(decoded2).to.equal('world2');
  });
  it('should throw when passed invalid wasm', async () => {
    buffer = await fetchBytes('/test/fixtures/package.json');
    await expect(instantiate(buffer)).to.be.rejectedWith(new errors.InvalidWasm(new Error()).matcher());
  });
  it('should instantiate from a Response object', async () => {
    // not supported in node
    const stream = fetch('/test/fixtures/rust_echo_string.wasm');
    const host = await instantiateStreaming(stream);
    const payload = encode({ msg: 'hello world' });
    const result = await host.invoke('echo', payload);
    expect(result).to.be.instanceOf(Uint8Array);
    const decoded = decode(result);
    expect(decoded).to.equal('hello world');
  });
});

/**
 * This function is to satisfy typescript. These tests run in a browser
 * and take the Wapc API from the global namespace so we have to hand wave
 * away the window object.
 * */
function getApiFromWindow(): typeof WapcJsApi {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  return win.waPC as typeof WapcJsApi;
}
