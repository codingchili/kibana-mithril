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

    // implement User here

    authenticate: function (username, password, callback) {
    },

    create: function (username, password, callback) {
    },

    getSecret: function (username, callback) {
    },

    setSecret: function (username, secret) {
    }
};
