/**
 * @author Robin Duda
 *
 * Provides a connection to a MongoDB instance.
 */

const Mongoose = require('mongoose');
const AuthenticationConfig = require('../config').load('authentication');
const MongoConfig = require('../config').load('mongodb');

Mongoose.connect(MongoConfig.remote);

let User = Mongoose.model('User', new Mongoose.Schema({
        username: String,
        secret: {
            key: String,
            verified: Boolean
        }
    }, {strict: true}
));

module.exports = {

    // todo implement
    authenticate: function (username, password, callback) {
        // on success
        callback(err, {uid: 'user-id', groups: 'groups[]'});
        // on failure
        // callback(new LDAP.NoSuchObjectError());
    },

    // todo implement
    member: function (id, callback) {
        let member = [];
        member.push('group name');
        callback(member);
    },

    /**
     * Creates a new user in the database, if it already exists it is updated.
     *
     * @param username specifies the user to be updated.
     * @param secret updates the user with a new 2-FA secret.
     */
    create: function (username, secret) {
        let user = {username: username, secret: {key: secret, verified: false}};

        User.update({username: username}, user, {upsert: true}, function (err) {
            if (err) throw err;
        });
    },

    /**
     * Returns the 2-FA secret of an user.
     *
     * @param username specifies the user which the secret is retrieved from.
     * @param callback Function {verified, secret}
     */
    getSecret: function (username, callback) {
        User.findOne({username: username}, function (err, result) {
            callback((result), (result) ? result.toJSON().secret : {});
        });
    },

    /**
     * Sets the verification status of an users 2-Factor authentication secret.
     *
     * @param username specifies the user to be updated.
     * @param verified indicates whether the secret is acknowledged or not.
     */
    setVerified: function (username, verified) {
        User.findOne({username: username}, function (err, result) {
            if (!err && result) {
                result.secret.verified = verified;
                result.save();
            }
        });
    },

    /**
     * Removes an user from the database.
     *
     * @param username specifies the user to remove.
     */
    remove: function (username) {
        User.remove({username: username}).exec();
    }
};
