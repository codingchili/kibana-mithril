/**
 * @author Robin Duda
 *
 * Authenticates user+password combinations against an LDAP server.
 */

const LDAP = require('ldapjs');
const JWT = require('jsonwebtoken');
const Config = require('./config').load('authentication');

const client = LDAP.createClient({url: Config.url});

client.bind(Config.admin.dn, Config.admin.password, function (err) {
  if (err)
    throw err;
});

module.exports = {

  /**
   * Finds and authenticates user in the directory by its uid
   * and the pre-configured dn.
   *
   * @param username of the account to be found.
   * @param password to use for authentication.
   * @param callback Function {error, account} called when authentication completes.
   */
  ldap: function (username, password, callback) {
    const search = {
      dn: Config.search["user-dn"],
      options: {
        scope: Config.search.scope,
        filter: new LDAP.filters.EqualityFilter({attribute: 'uid', value: username})
      }
    };

    client.search(search.dn, search.options, function (err, result) {
      var found = false;

      result.on('searchEntry', function (entry) {
        found = true;

        // Verify credentials by binding to the LDAP server.
        LDAP.createClient({url: Config.url})
          .bind(entry.dn, password, function (err) {

            module.exports.member(entry.object.uid, function (groups) {
              callback(err, {uid: entry.object.uid, groups: groups});
            });

          });
      });

      result.on('end', function () {
        if (!found) {
          callback(new LDAP.NoSuchObjectError());
        }
      });
    });
  },

  /**
   * Retrieve a list of groups an user is member of.
   *
   * @param id of the user to look for group membership.
   * @param callback Function {Boolean}
   */
  member: function (id, callback) {
    const search = {
      dn: Config.search["group-dn"],
      options: {
        scope: Config.search.scope,
        filter: new LDAP.filters.AndFilter({
          filters: [
            new LDAP.filters.EqualityFilter({attribute: 'objectClass', value: 'groupOfNames'}),
            new LDAP.filters.EqualityFilter({attribute: 'member', value: 'uid=' + id})
          ]
        })
      }
    };

    client.search(search.dn, search.options, function (err, result) {
      var member = [];

      result.on('searchEntry', function (entry) {
        member.push(entry.object.cn);
      });

      result.on('end', function () {
        callback(member);
      });
    });
  },

  /**
   * Signs a JWT token with a configured secret.
   *
   * @param uid the unique user id to sign token with.
   * @param groups the token is authorized for.
   * @returns {String}
   */
  signToken: function (uid, groups) {
    return JWT.sign(
      {
        id: uid,
        groups: groups,
        expiry: new Date().getTime() + (7 * 24 * 60 * 60 * 1000)
      },
      Config.secret);
  },

  /**
   * Verifies the validity of a token.
   * @param token to be verified.
   * @return Boolean
   */
  verifyToken: function (token) {
    var decoded = JWT.verify(token, Config.secret);
    var valid = (new Date().getTime() < decoded.expiry);

    if (!decoded || !valid)
      throw new Error();

    return decoded;
  }
};
