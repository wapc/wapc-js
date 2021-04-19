"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const mocha_1 = require("mocha");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const msgpack_1 = require("@msgpack/msgpack");
chai_1.default.use(chai_as_promised_1.default);
const expect = chai_1.default.expect;
const src_1 = require("../src");
mocha_1.describe('WapcHost', function () {
    let buffer;
    beforeEach(() => {
        buffer = fs_1.default.readFileSync(path_1.default.join(__dirname, 'fixtures', 'rust_echo_string.wasm'));
    });
    it('should create instance', async () => {
        const host = await src_1.instantiate(buffer);
        expect(host).to.be.instanceOf(src_1.WapcHost);
    });
    it('should invoke guest operation', async () => {
        const host = await src_1.instantiate(buffer);
        const payload = msgpack_1.encode({ msg: 'hello world' });
        const result = await host.invoke('echo', payload);
        expect(result).to.be.instanceOf(Uint8Array);
        const decoded = msgpack_1.decode(result);
        expect(decoded).to.equal('hello world');
    });
    it('guests should be able to invoke host calls', async () => {
        buffer = fs_1.default.readFileSync(path_1.default.join(__dirname, 'fixtures', 'rust_host_call.wasm'));
        const host = await src_1.instantiate(buffer, (binding, namespace, operation, payload) => {
            expect(namespace).to.equal('myNamespace');
            expect(binding).to.equal('myBinding');
            expect(operation).to.equal('myOperation');
            const decoded = msgpack_1.decode(payload);
            expect(decoded).to.equal('this is the payload');
            return new Uint8Array(msgpack_1.encode(decoded.toUpperCase()));
        });
        const payload = msgpack_1.encode({
            namespace: 'myNamespace',
            binding: 'myBinding',
            operation: 'myOperation',
            msg: 'this is the payload',
        });
        const result = await host.invoke('callback', payload);
        expect(result).to.be.instanceOf(Uint8Array);
        const decoded = msgpack_1.decode(result);
        expect(decoded).to.equal('THIS IS THE PAYLOAD');
    });
    it('should throw when running guests that invoke an unimplemented host call', async () => {
        buffer = fs_1.default.readFileSync(path_1.default.join(__dirname, 'fixtures', 'rust_host_call.wasm'));
        const host = await src_1.instantiate(buffer);
        const payload = msgpack_1.encode({
            namespace: 'ns',
            binding: 'bind',
            operation: 'op',
            msg: 'this is the payload',
        });
        await expect(host.invoke('callback', payload)).to.be.rejectedWith(new src_1.errors.HostCallNotImplementedError('bind', 'ns', 'op').matcher());
    });
    it('should run multiple guests', async () => {
        const host = await src_1.instantiate(buffer);
        const host2 = await src_1.instantiate(buffer);
        const result = await host.invoke('echo', msgpack_1.encode({ msg: 'world' }));
        const decoded = msgpack_1.decode(result);
        const result2 = await host2.invoke('echo', msgpack_1.encode({ msg: 'world2' }));
        const decoded2 = msgpack_1.decode(result2);
        expect(decoded).to.equal('world');
        expect(decoded2).to.equal('world2');
    });
    it('should throw when passed invalid wasm', async () => {
        buffer = fs_1.default.readFileSync(path_1.default.join(__dirname, '..', 'package.json'));
        await expect(src_1.instantiate(buffer)).to.be.rejectedWith(new src_1.errors.InvalidWasm(new Error()).matcher());
    });
});
//# sourceMappingURL=index.test.js.map