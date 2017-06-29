/**
 *
 */

module.exports = {
    hash: (plaintext, callback) => {
        callback(plaintext); // todo argon2/scrypt
    },

    verify: (hash, plaintext, callback) => {
        module.exports.hash(result => {
            callback(result == hash); // todo constant time compare
        });
    }
}