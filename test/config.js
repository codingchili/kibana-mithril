/**
 * @author Robin Duda
 *
 * Tests the loading and reading of the configuration file.
 */

const Assert = require('assert');

describe('Configuration reader', function () {

  it('Should read and verify the LDAP configuration.', function () {
    var config = require('../src/config').load('authentication');

    Assert.notEqual(config, 'Failed to load configuration file.');
    Assert.notEqual(config.url, null);
    Assert.notEqual(config.admin, null);
    Assert.notEqual(config.admin.dn, null);
    Assert.notEqual(config.admin.password, null);
    Assert.notEqual(config.search, null);
    Assert.notEqual(config.search.scope, null);
    Assert.notEqual(config.search["user-dn"], null);
    Assert.notEqual(config.search["group-dn"], null);
  });

  it('Should read and verify the Two Factor configuration.', function () {
    var config = require('../src/config').load('two-factor');

    Assert.notEqual(config, 'Failed to load configuration file.', null);
    Assert.notEqual(config.length, null);
  });

  it('Should read and verify the Login/Cookie configuration.', function () {
    var config = require('../src/config').load('authentication');

    Assert.notEqual(config, 'Failed to load configuration file.');
    Assert.notEqual(config.cookie, null);
    Assert.notEqual(config.cookie.ttl, null);
    Assert.notEqual(config.secret, null);
  });

});
