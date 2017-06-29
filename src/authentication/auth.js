/**
 * @author Robin Duda
 *
 * Authenticates user+password combinations against an LDAP server.
 */

const JWT = require('jsonwebtoken');
const Config = require('../config').load('authentication');

module.exports = {

    /**
     * Finds and authenticates user in the directory by its uid
     * and the pre-configured dn.
     *
     * @param username of the account to be found.
     * @param password to use for authentication.
     * @param callback Function {error, account} called when authentication completes.
     */
    authenticate: function (username, password, callback) {
        // todo call implementation
    },

    /**
     * Retrieve a list of groups an user is member of.
     *
     * @param id of the user to look for group membership.
     * @param callback Function {Boolean}
     */
    member: function (id, callback) {
        // todo call implementation
    },

    /**
     * Creates a new user in the database, if it already exists it is updated.
     *
     * @param username specifies the user to be updated.
     * @param secret updates the user with a new 2-FA secret.
     */
    create: function (username, secret) {
        // todo call implementation
    },

    /**
     * Returns the 2-FA secret of an user.
     *
     * @param username specifies the user which the secret is retrieved from.
     * @param callback Function {verified, secret}
     */
    getSecret: function (username, callback) {
        // todo call implementation
    },

    /**
     * Sets the verification status of an users 2-Factor authentication secret.
     *
     * @param username specifies the user to be updated.
     * @param verified indicates whether the secret is acknowledged or not.
     */
    setVerified: function (username, verified) {
        // todo call implementation
    },

    /**
     * Removes an user from the database.
     *
     * @param username specifies the user to remove.
     */
    remove: function (username) {
        // todo call implementation
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
