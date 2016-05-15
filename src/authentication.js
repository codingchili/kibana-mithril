/**
 * @author Robin Duda
 *
 * Authenticates user+password combinations against an LDAP server.
 */

const LDAP = require('ldapjs');
const Config = require('./config').load('ldap');

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
      dn: Config.search.dn,
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
            callback(err, entry);
          });
      });

      result.on('end', function () {
        if (!found) {
          callback(new LDAP.NoSuchObjectError());
        }
      });
    });
  }
};
