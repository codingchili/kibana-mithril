/**
 * @author Robin Duda
 *
 * Wraps mongoose so that tests can mock connections and the user model.
 */

let Mongoose = require('mongoose');

module.exports = {

    mock: function(model) {
      Mongoose.model = function () {
        return model;
      };
      Mongoose.connect = function () {
        // no connection when mocked.
      };
    },

    mongoose: function() {
        return Mongoose;
    }
};