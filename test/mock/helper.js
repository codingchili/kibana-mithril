const Hash = require('../../src/authentication/hash');
const USERNAME = 'username';
const PASSWORD = 'password';
const PASSWORD_WRONG = 'pass-wrong';

let users = {
    username: {uid: USERNAME, password: null, groups: ['default'], secret: {}, toJSON: () => {
        return users[USERNAME];
    }}
};

module.exports = {
    USERNAME: USERNAME,
    PASSWORD: PASSWORD,
    PASSWORD_WRONG: PASSWORD_WRONG,

    init: function (callback) {
        require('./ldap').init();
        require('../../src/authentication/goosewrapper').mock(User);
        require('../../src/authentication/file').create(USERNAME, PASSWORD, (err) => {
            Hash.password(PASSWORD, hash => {
                users[USERNAME].password = hash;
                callback(err);
            });
        });
    }
};

// used to mock away the Mongoose.model data access object.
class User {

    User(data) {
        this.uid = data.username;
        this.password = data.password;
        this.groups = data.groups;
        this.secret = data.secret;
        this.toJSON = () => {}; // used for mongoose models only.
    }

    save(userToSave) {
        let user = this;

        if (userToSave) {
            user = userToSave;
        }
        users[user.username] = {
            username: user.username,
            password: user.password,
            secret: (user.secret) ? user.secret : {verified: false},
            groups: (user.groups) ? user.groups : []
        };
    }

    static update(username, user) {
        console.log('updating ' + username);
        module.exports.save(user);
    }

    static findOne(query, callback) {
        if (query.username in users) {
            callback(null, users[query.username]);
        } else {
            callback({'error': 'authentication failure'});
        }
    }
}