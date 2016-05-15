/**
 * @author Robin Duda
 *
 * Provides a connection to a MongoDB instance.
 */

const Mongoose = require('mongoose');
const Config = require('./config').load('mongodb');

Mongoose.connect(Config.remote);

module.exports = {
  get: function get() {
    return Mongoose;
  }
};
