/**
 * @author Robin Duda
 *
 * Authenticates users against an user store and a two-factor key storage.
 */

const JWT = require('jsonwebtoken');
const Config = require('../config').get();
let Storage = require('./' + Config.storage);

module.exports = {

    /**
     * Sets the storage implementation to use.
     * @param storage the storage to use.
     */
    setStorage: storage => {
        Storage = require('./' + storage);
    },

    /**
     * Finds and authenticates user in the directory by its uid
     * and the pre-configured dn.
     *
     * @param username of the account to be found.
     * @param password to use for authentication.
     * @param callback Function {error, account} called when authentication completes.
     */
    authenticate: (username, password, callback) => {
        Storage.authenticate(username, password, callback);
    },

    /**
     * Creates a new user account in the storage if supported.
     *
     * @param username of the account to create
     * @param password of the account to create
     * @param callback Function {error} callen on completion.
     */
    create: (username, password, callback) => {
        Storage.create(username, password, callback);
    },

    /**
     * Signs a JWT token with a configured secret.
     *
     * @param uid the unique user id to sign token with.
     * @param groups the token is authorized for.
     * @returns {String}
     */
    signToken: function (uid, groups) {
        return JWT.sign(
            {
                id: uid,
                groups: groups,
                expiry: new Date().getTime() + (7 * 24 * 60 * 60 * 1000)
            },
            Config.authentication.secret);
    },

    /**
     * Verifies the validity of a token.
     * @param token to be verified.
     * @return Boolean
     */
    verifyToken: function (token) {
        let decoded = JWT.verify(token, Config.authentication.secret);
        let valid = (new Date().getTime() < decoded.expiry);

        if (!decoded || !valid)
            throw new Error();

        return decoded;
    }
};
