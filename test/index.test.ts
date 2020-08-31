import { expect } from 'chai';
import { describe } from 'mocha';
import { start, TestServer } from '@jsoverson/test-server';

import * as index from '../src';

describe('main', function () {
  // Setup and teardown for a local HTTP server.
  // Remove this section if you don't need to make HTTP requests.
  // More info: https://github.com/jsoverson/test-server

  /******************************
   *   HTTP test server setup   *
   ******************************/
  let server: TestServer;

  before(async () => {
    server = await start(__dirname, 'server_root');
  });

  after(async () => {
    await server.stop();
  });
  /******************************
   * End HTTP test server setup *
   ******************************/

  it('TODO REMOVE ME', () => {
    expect(index.main()).to.not.equal('TODO remove stub implementation');
  });
});
