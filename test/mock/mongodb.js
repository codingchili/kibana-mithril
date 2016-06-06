/**
 * @author Robin Duda
 *
 * Mock implementation of users (MongoDB) for testing
 * modules that depend on MongoDB.
 *
 * For documentation see users.js
 */

var users = {};

module.exports = {

  getSecret: function (username, token, callback) {
    callback(users[username], users[username].secret);
  },

  setVerified: function (username, verified) {
    users[username].verified = verified;
  },

  create: function (username, key) {
    users[username].secret = {key: key, verified: false};
  },

  remove: function (username) {
    users[username] = null;
  }
};
