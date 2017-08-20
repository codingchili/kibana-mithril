/**
 * @author Robin Duda
 *
 * Authenticates user+password combinations against an LDAP server.
 */

const LDAP = require('ldapjs');
const Config = require('../config').load('ldap');
const File = require('./file');
const client = LDAP.createClient({url: Config.url});

client.bind(Config.admin.dn, Config.admin.password, err => {
    if (err)
        throw err;
});

function member(id, callback) {
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

    client.search(search.dn, search.options, (err, result) => {
        let member = [];

        result.on('searchEntry', entry => {
            member.push(entry.object.cn);
        });

        result.on('end', () => {
            callback(member);
        });
    });
}

module.exports = {

    authenticate: function (username, password, callback) {
        const search = {
            dn: Config.search["user-dn"],
            options: {
                scope: Config.search.scope,
                filter: new LDAP.filters.EqualityFilter({attribute: 'uid', value: username})
            }
        };

        client.search(search.dn, search.options, (err, result) => {
            let found = false;

            result.on('searchEntry', entry => {
                found = true;

                // Verify api by binding to the LDAP server.
                LDAP.createClient({url: Config.url})
                    .bind(entry.dn, password, err => {

                        member(entry.object.uid, groups => {
                            callback(err, {uid: entry.object.uid, groups: groups});
                        });

                    });
            });

            result.on('end', () => {
                if (!found) {
                    callback(new LDAP.NoSuchObjectError());
                }
            });
        });
    },

    create: function (username, password, callback) {
        throw new Error('LDAP create user is unsupported.');
    },

    // ldap server does not implement 2fa storage, use on-disk.
    getSecret: File.getSecret,
    setSecret: File.setSecret,
};
