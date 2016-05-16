/**
 * @author Robin Duda
 *
 * Tests the connection to the LDAP server.
 */


const Assert = require('assert');
const Authentication = require('../src/authentication');
const LDAP = require('ldapjs');
const Server = LDAP.createServer();

const USERNAME = 'username';
const PASSWORD = 'password';
const PASSWORD_WRONG = 'pass-wrong';


describe('LDAP Authentication', function () {

  before(function () {
    Server.listen(10388, '0.0.0.0');

    Server.bind('uid=admin,ou=system', function (req, res, next) {
      if (req.credentials === PASSWORD_WRONG) {
        return next(new LDAP.InvalidCredentialsError());
      } else {
        res.end();
        return next();
      }
    });

    Server.search('ou=users,ou=system', function (req, res, next) {
      var entry = {
        dn: 'uid=admin, ou=system',
        attributes: {
          objectclass: ['top', 'organization'],
          o: ['system'],
          uid: USERNAME
        }
      };

      // Returns an entry for all other searches, simulating a missing entry.
      if (req.filter.json.value === 'missing') {
        res.end();
        return next();
      } else {
        res.send(entry);
        res.end();
        return next();
      }
    });
  });


  Server.search('ou=groups,ou=system', function (req, res, next) {
    var entry = {
      dn: 'ou=groups,ou=system',
      attributes: {
        objectClass: 'groupOfNames',
        member: 'uid=' + USERNAME,
        cn: 'group-name'
      }
    };

    res.send(entry);
    res.end();
    return next();
  });

  it('Should bind successfully with a client.', function (done) {
    Authentication.ldap(USERNAME, PASSWORD, function (err, user) {
      Assert.equal(user.uid, USERNAME);
      Assert.equal(err, null);
      done();
    });
  });

  it('Should fail to bind with an user using wrong password.', function (done) {
    Authentication.ldap(USERNAME, PASSWORD_WRONG, function (err, user) {
      Assert.notEqual(err, null);
      done();
    });
  });

  it('Should fail to bind with a user that do not exist.', function (done) {
    Authentication.ldap('missing', PASSWORD, function (err, user) {
      Assert.equal(user, null);
      Assert.notEqual(err, null);
      done();
    });
  });

  it('Should retrieve all the groups an user is member of.', function (done) {
    Authentication.ldap(USERNAME, PASSWORD, function (err, user) {
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
