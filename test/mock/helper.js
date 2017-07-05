const USERNAME = 'username';
const PASSWORD = 'password';
const PASSWORD_WRONG = 'pass-wrong';

module.exports = {
    USERNAME: USERNAME,
    PASSWORD: PASSWORD,
    PASSWORD_WRONG: PASSWORD_WRONG,

    init: function (callback) {
        require('./ldap').init();
        require('../../src/authentication/file').create(USERNAME, PASSWORD, (err) => {
            callback(err);
        });
    }
};