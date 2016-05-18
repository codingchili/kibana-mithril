const LDAP = require('ldapjs');
const Server = LDAP.createServer();

const USERNAME = 'username';
const PASSWORD = 'password';
const PASSWORD_WRONG = 'pass-wrong';

module.exports = {
  USERNAME: USERNAME,
  PASSWORD: PASSWORD,
  PASSWORD_WRONG: PASSWORD_WRONG,

  init: function () {
    Server.listen(10388, '0.0.0.0');

    Server.bind('uid=admin,ou=system', authenticateAdmin);
    Server.search('ou=users,ou=system', findUser);
    Server.search('ou=groups,ou=system', findGroups);
  }
};

function authenticateAdmin (req, res, next) {
  if (req.credentials === PASSWORD_WRONG) {
    return next(new LDAP.InvalidCredentialsError());
  } else {
    res.end();
    return next();
  }
}

function findUser (req, res, next) {
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
}

function findGroups (req, res, next) {
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
}
