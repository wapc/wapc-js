import { expect } from 'chai';
import { describe } from 'mocha';

import src from '../src';

import pkg from '../package.json';

describe('main', function () {
  it('should have been changed', () => {
    expect(src()).to.not.throw();
  });

  describe('package.json', function () {
    it('name should be filled out', () => {
      expect(pkg.name).to.not.equal('');
    });
    it('description should be filled out', () => {
      expect(pkg.description).to.not.equal('');
    });
    it('author should be filled out', () => {
      expect(pkg.author).to.not.equal('');
    });
  });
});
