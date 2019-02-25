/**
 * @author Robin Duda
 *
 * Authenticates user+password combinations against an LDAP server.
 */

const LDAP = require('ldapjs');
const Config = require('../config').load('ldap');
const File = require('./file');
const client = LDAP.createClient({url: Config.url});
const Logger = require('../logger');

const usernameAttribute = Config.search['user-name'];

// error handling in the LDAP library fails to handle certain errors for some vendors.
process.on('uncaughtException', (err) => {
	const {msg, stack} = err;
	console.log(msg);
	console.log(stack);
});

client.bind(Config.admin.dn, Config.admin.password, err => {
    if (err) {
        throw err;
    }
});

function member(id, callback) {
    const search = {
        dn: Config.search["group-dn"],
        options: {
            scope: Config.search.scope,
            filter: new LDAP.filters.AndFilter({
                filters: [
                    new LDAP.filters.EqualityFilter({attribute: 'objectClass', value: 'groupOfNames'}),
                    new LDAP.filters.EqualityFilter({attribute: 'member', value: usernameAttribute + '=' + id})
                ]
            })
        }
    };

    client.search(search.dn, search.options, (err, result) => {
        let member = [];

	if (err) {
		callback(err, member);
	} else {
        result.on('searchEntry', entry => {
            member.push(entry.object.cn);
        });

        result.on('end', () => {
            callback(err, member);
        });
	}
    });
}

module.exports = {

    authenticate: function (username, password, callback) {
        const search = {
            dn: Config.search["user-dn"],
            options: {
                scope: Config.search.scope,
                filter: new LDAP.filters.EqualityFilter({attribute: usernameAttribute, value: username})
            }
        };

        client.search(search.dn, search.options, (err, result) => {
            let found = false;

            if (err) {
                callback(err);
            } else {
                result.on('searchEntry', entry => {
                    found = true;

                    // Verify api by binding to the LDAP server.
                    LDAP.createClient({url: Config.url})
                        .bind(entry.dn, password, err => {

                            if (err) {
                                callback(err);
                            } else {
                                member(entry.object[usernameAttribute], groups => {
                                    callback(err, {uid: entry.object[usernameAttribute], groups: groups});
                                });
                            }
                        });
                });

                result.on('end', () => {
                    if (!found) {
                        callback(new LDAP.NoSuchObjectError());
                    }
                });
            }
        });
    },

    create: function (username, password, callback) {
        throw new Error('LDAP create user is unsupported.');
    },

    // ldap server does not implement 2fa storage, use on-disk.
    getSecret: File.getSecret,
    setSecret: File.setSecret,
};
