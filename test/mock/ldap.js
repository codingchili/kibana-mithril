const LDAP = require('ldapjs');
const Server = LDAP.createServer();
const Mock = require('./helper');
let init = false;

module.exports = {

    init: () => {
        if (!init) {
            Server.listen(10388, '0.0.0.0');
            Server.bind('uid=admin,ou=system', authenticateAdmin);

            Server.search('ou=users,ou=system', findUser);
            Server.search('ou=groups,ou=system', findGroups);
        }
        init = true;
    }
};

function authenticateAdmin(req, res, next) {
    if (req.credentials === Mock.PASSWORD_WRONG) {
        return next(new LDAP.InvalidCredentialsError());
    } else {
        res.end();
        return next();
    }
}

function findUser(req, res, next) {
    let entry = {
        dn: 'uid=admin, ou=system',
        attributes: {
            objectclass: ['top', 'organization'],
            o: ['system'],
            uid: Mock.USERNAME
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
}

function findGroups(req, res, next) {
    let entry = {
        dn: 'ou=groups,ou=system',
        attributes: {
            objectClass: 'groupOfNames',
            member: 'uid=' + Mock.USERNAME,
            cn: 'group-name'
        }
    };

    res.send(entry);
    res.end();
    return next();
}
