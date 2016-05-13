/**
 * @author Robin Duda
 *
 * Tests the loading and reading of the configuration file.
 */

const Assert = require('assert');

describe('Configuration reader', function () {

  it('Should read and verify the LDAP configuration.', function () {
    var config = require('../lib/config').load('ldap');

    Assert.notEqual(null, config, 'Failed to load configuration file.');
    Assert.notEqual(null, config.url);
    Assert.notEqual(null, config.admin);
    Assert.notEqual(null, config.admin.dn);
    Assert.notEqual(null, config.admin.password);
    Assert.notEqual(null, config.search);
    Assert.notEqual(null, config.search.scope);
    Assert.notEqual(null, config.search.dn);
  });

  it('Should read and verify the Two Factor configuration.', function () {
    var config = require('../lib/config').load('two-factor');

    Assert.notEqual(null, config, 'Failed to load configuration file.');
    Assert.notEqual(null, config.length);
  });

  it('Should read and verify the Login/Cookie configuration.', function () {
    var config = require('../lib/config').load('login');

    Assert.notEqual(null, config, 'Failed to load configuration file.');
    Assert.notEqual(null, config.cookie);
    Assert.notEqual(null, config.cookie.ttl);
    Assert.notEqual(null, config.secret);
  });

});
