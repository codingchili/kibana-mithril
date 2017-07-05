/**
 * @author Robin Duda
 *
 * Provides a connection to a MongoDB instance.
 */

const Mongoose = require('mongoose');
const MongoConfig = require('../config').load('mongodb');
const Hash = require('./hash');

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

    authenticate: function (username, password, callback) {
        User.findOne({username: username}, (err, user) => {
            if (err) {
                callback({'error': 'authentication failure'});
            } else {
                Hash.verify(user.password, password, success => {
                    if (success) {
                        callback(null, user.toJSON());
                    } else {
                        callback({'error': 'password failure'});
                    }
                });
            }
        });
    },

    create: function (username, password, callback) {
        let user = new User({username: username});
        Hash.password(password, hash => {
            user.password = hash;
            user.groups = [];
            user.save();
            callback(null);
        });
    },

    setSecret: function (username, secret) {
        let user = {username: username, secret: {key: secret, verified: false}};

        User.update({username: username}, user, {upsert: true}, err => {
            if (err)
                throw err;
        });
    },

    getSecret: function (username, callback) {
        User.findOne({username: username}, (err, result) => {
            callback(result, (result) ? result.toJSON().secret : {});
        });
    }
};

module.exports.create('admin', 'admin', () => {
});
