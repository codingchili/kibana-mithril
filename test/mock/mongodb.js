/**
 * @author Robin Duda
 *
 * Mock implementation of users (MongoDB) for testing
 * modules that depend on MongoDB.
 *
 * For documentation see users.js
 */

let users = {};

module.exports = {

    create: function (username, password, callback) {
        users[username] = {password: password};
        callback(null);
    },

    authenticate: function (username, password, callback) {
        if (users[username].password === password) {
            callback(null, users[username]);
        } else {
            callback({'error': 'failed to authenticate'});
        }
    },

    getSecret: function (username, token, callback) {
        callback(users[username], users[username].secret);
    },

    setVerified: function (username, verified) {
        users[username].verified = verified;
    },

    remove: function (username) {
        users[username] = null;
    }
};
