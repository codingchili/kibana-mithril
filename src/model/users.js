/**
 * @author Robin Duda
 *
 * Persists user settings in a MongoDB database.
 */

var Mongoose = require('../database').get();

var User = Mongoose.model('User', new Mongoose.Schema({
    username: String,
    secret: {
      key: String,
      verified: Boolean
    }
  }, {strict: true}
));

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
  }
};
