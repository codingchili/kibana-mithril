/**
 * @author Robin Duda
 *
 * Authenticates user+password combinations against a json file on disk.
 */

const Config = require('../config').load('file');
const Hash = require('./hash');
const fs = require('fs');
let users = [];


function load() {
    let data = '{}';
    try {
        data = fs.readFileSync(Config.filename, {});
    } catch (e) {
        // no data yet, ignore errors.
    }
    users = JSON.parse(data);
}

function save() {
    fs.writeFile(Config.filename, JSON.stringify(users), (err) => {
        if (err) {
            throw err;
        }
    });
}

load();

module.exports = {

    authenticate: function (username, password, callback) {
        if (username in users) {
            Hash.verify(users[username].password, password, equals => {
                if (equals) {
                    callback(null, users[username])
                } else {
                    callback({'error': 'password failure'});
                }
            });
        } else {
            callback({'error': 'authentication failure'});
        }
    },

    create: function (username, password, callback) {
        Hash.password(password, hash => {
            users[username] = {
                uid: username,
                password: hash,
                groups: ['default']
            };
            save();
            callback(null);
        });
    },

    getSecret: function (username, callback) {
        if (username in users) {
            callback(true, users[username].secret);
        } else {
            callback(false);
        }
    },

    setSecret: function (username, secret) {
        if (!(username in users)) {
            users[username] = {};
        }
        users[username].secret = {
            'key': secret,
            'verified': false
        };
        save();
    }
};