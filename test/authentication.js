/**
 * @author Robin Duda
 *
 * Tests the connection to the LDAP server.
 */


const Assert = require('assert');
const Authentication = require('../src/authentication');
const Mock = require('./mock/LDAP');

describe('LDAP Authentication', function () {

  before((function () {
    Mock.init();
  }));

  it('Should bind successfully with a client.', function (done) {
    Authentication.ldap(Mock.USERNAME, Mock.PASSWORD, function (err, user) {
      Assert.equal(user.uid, Mock.USERNAME);
      Assert.equal(err, null);
      done();
    });
  });

  it('Should fail to bind with an user using wrong password.', function (done) {
    Authentication.ldap(Mock.USERNAME, Mock.PASSWORD_WRONG, function (err, user) {
      Assert.notEqual(err, null);
      done();
    });
  });

  it('Should fail to bind with a user that do not exist.', function (done) {
    Authentication.ldap('missing', Mock.PASSWORD, function (err, user) {
      Assert.equal(user, null);
      Assert.notEqual(err, null);
      done();
    });
  });

  it('Should retrieve all the groups an user is member of.', function (done) {
    Authentication.ldap(Mock.USERNAME, Mock.PASSWORD, function (err, user) {
      Assert.equal(user.groups.length, 1);
      Assert.equal(err, null);
      done();
    });
  });

  it('Should create and verify a valid token', function () {
    var token = Authentication.signToken('id', ['group']);
    token = Authentication.verifyToken(token);

    Assert.equal('id', token.id);
    Assert.equal('group', token.groups[0]);
  });

  it('Should fail to verify an invalid token', function () {
    var token = "error";

    try {
      Authentication.verifyToken(token);
      Assert.equal(true, false, 'Error expected.');
    } catch (err) {
    }
  });

});
