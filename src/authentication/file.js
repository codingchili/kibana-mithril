/**
 * @author Robin Duda
 *
 * Authenticates user+password combinations against a json file on disk.
 */

const Config = require('../config').load('authentication');

module.exports = {

    authenticate: function (username, password, callback) {
        // on success
        callback(err, {uid: 'user-id', groups: 'groups[]'});
        // on failure
        // callback(new LDAP.NoSuchObjectError());
    },

    member: function (id, callback) {
        let member = [];
        member.push('group name');
        callback(member);
    }
};