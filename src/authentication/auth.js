/**
 * @author Robin Duda
 *
 * Authenticates users against an user store and a two-factor key storage.
 */

const JWT = require('jsonwebtoken');
const Config = require('../config').get();
const Storage = require('./' + Config.storage);
const TwoFactor = require('./twofactor');

module.exports = {

    /**
     * Finds and authenticates user in the directory by its uid
     * and the pre-configured dn.
     *
     * @param username of the account to be found.
     * @param password to use for authentication.
     * @param callback Function {error, account} called when authentication completes.
     */
    authenticate: Storage.authenticate,

    /**
     * Creates a new user in the database, if it already exists it is updated.
     *
     * @param username specifies the user to be updated.
     * @param secret updates the user with a new 2-FA secret.
     */
    create: Storage.create,

    /**
     * Returns the 2-FA secret of an user.
     *
     * @param username specifies the user which the secret is retrieved from.
     * @param callback Function {verified, secret}
     */
    getSecret: Storage.getSecret,

    /**
     * Sets the verification status of an users 2-Factor authentication secret.
     *
     * @param username specifies the user to be updated.
     * @param verified indicates whether the secret is acknowledged or not.
     */
    setVerified: Storage.setVerified,

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
      Config.secret);
  },

  /**
   * Verifies the validity of a token.
   * @param token to be verified.
   * @return Boolean
   */
  verifyToken: function (token) {
    let decoded = JWT.verify(token, Config.secret);
    let valid = (new Date().getTime() < decoded.expiry);

    if (!decoded || !valid)
      throw new Error();

    return decoded;
  }
};
