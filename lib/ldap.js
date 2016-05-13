/**
 * @author Robin Duda
 *
 * Authenticates user+password combinations against an LDAP server.
 */

const LDAP = require('ldapjs');
const config = require('./config').load('ldap');

const client = LDAP.createClient({url: config.url});

client.bind(config.admin.dn, config.admin.password, function (err) {
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
  authenticate: function (username, password, callback) {
    const search = {
      dn: config.search.dn,
      options: {
        scope: config.search.scope,
        filter: new LDAP.filters.EqualityFilter({attribute: 'uid', value: username})
      }
    };

    client.search(search.dn, search.options, function (err, result) {
      var found = false;

      result.on('searchEntry', function (entry) {
        found = true;

        // Verify credentials by binding to the LDAP server.
        LDAP.createClient({url: config.url})
          .bind(entry.dn, password, function (err) {
              callback(err, {user: username}); //todo include group
          });
      });

      result.on('end', function () {
        if (!found) {
          callback(err);
        }
      });
    });
  }
};
