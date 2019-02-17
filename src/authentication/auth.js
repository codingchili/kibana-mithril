/**
 * @author Robin Duda
 *
 * Authenticates users against an user store and a two-factor key storage.
 */

const JWT = require('jsonwebtoken');
const crypto = require('crypto');
const Config = require('../config');
const Logger = require('../logger');

let Storage = require('./' + Config.get().storage);


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
            module.exports.secret());
    },

    /**
     * Returns the secret key used to sign tokens.
     */
    secret: function() {
        if (!Config.secret()) {
            // generate a random secret if none is set.
            let secret = crypto.randomBytes(64).toString('base64');
            Config.setSecret(secret);
            Logger.generatedSecret();
        }
        return Config.secret();
    },

    /**
     * Verifies the validity of a token.
     * @param token to be verified.
     * @return Boolean
     */
    verifyToken: function (token) {
        let decoded = JWT.verify(token, Config.secret());
        let valid = (new Date().getTime() < decoded.expiry);

        if (!decoded || !valid) {
            throw new Error();
        }

        return decoded;
    }
};