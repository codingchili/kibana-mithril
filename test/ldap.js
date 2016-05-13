/**
 * @author Robin Duda
 *
 * Tests the connection to the LDAP server.
 */


const Assert = require('assert');
const LDAP = require('../lib/ldap');
const LDAPJS = require('ldapjs');
const Server = LDAPJS.createServer();

const USERNAME = 'username';
const PASSWORD = 'password';
const PASSWORD_WRONG = 'pass-wrong';


describe('LDAP Implementation', function () {

  before(function () {
    Server.listen(10388, '0.0.0.0');

    Server.bind('uid=admin,ou=system', function (req, res, next) {

      // todo handle invalid credentials

      res.end();
      return next();
    });

    Server.search('ou=users,ou=system', function (req, res, next) {
      var entry = {
        dn: 'uid=admin, ou=system',
        attributes: {
          objectclass: ['top', 'organization'],
          o: ['system']
        }
      };

      // Returns an entry for all other searches, simulating a missing entry.
      if (req.filter.json.value === 'missing')
        res.send({attributes: {}});
      else
        res.send(entry);

      res.end();
      return next();
    });
  });

  it('Should bind successfully with a client.', function (done) {
    LDAP.authenticate(USERNAME, PASSWORD, function (err, user) {
      Assert.equal('uid=admin, ou=system', user.dn);
      done();
    });
  });

 /* it('Should fail to bind with an user using wrong password.', function (done) {
    LDAP.authenticate(USERNAME, PASSWORD_WRONG, function (err, user) {
      Assert.equal(null, user);
      done();
    });
  }); */

  it('Should fail to bind with a user that do not exist.', function (done) {
    LDAP.authenticate('missing', PASSWORD, function (err, user) {
      Assert.equal(null, user);
      done();
    });
  });

});
