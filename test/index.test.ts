import { expect } from 'chai';
import { describe } from 'mocha';

import { main } from '../src';

import pkg from '../package.json';

describe('main', function () {
  it('should have been changed', () => {
    expect(main()).to.not.match(/todo/i);
  });

  describe('package.json', function () {
    it('name should not be typescript-boilerplate', () => {
      expect(pkg.name).to.not.equal('typescript-boilerplate');
    });
    it('description should be filled out', () => {
      expect(pkg.description).to.not.match(/todo/i);
    });
    it('author should be filled out', () => {
      expect(pkg.author).to.not.match(/todo/i);
    });
  });
});
