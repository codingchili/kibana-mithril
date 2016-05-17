/**
 * Handles the storage of user data within elasticsearch.
 * Replaces the previous module that used MongoDB to avoid
 * additional dependencies.
 */

const Request = require('request');

const User = {
  create: function (id, user) {

  },

  getSecret: function (id, callback) {

  },

  setVerified: function (id, callback) {

  },

  remove: function (id) {

  },

  setIndex: function (id, index) {

  }
};

module.exports = {

  /**
   * Creates a new user in the database, if it already exists it is updated.
   *
   * @param username specifies the user to be updated.
   * @param secret updates the user with a new 2-FA secret.
   */
  create: function (username, secret) {
    var user = {username: username, secret: {key: secret, verified: false}};

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
  },

  /**
   * Sets the currently selected (default) index for an user.
   *
   * @param username specifies the user.
   * @param index the index to be set as default.
     */
  setIndex: function (username, index) {
    User.setIndex(username, index);
  }
};
