/**
 * @author Robin Duda
 *
 * Hashes passwords for long-term storage.
 */

module.exports = {

    /**
     * Hashes the given plaintext as a password.
     *
     * @param plaintext the password plaintext to be hashed.
     * @param callback called with the resulting hash.
     */
    password: (plaintext, callback) => {
        callback(plaintext + ".HASHED"); // todo argon2/scrypt
    },

    /**
     * Verifies the given plaintext against the given hash by
     * hashing the plaintext and comparing the hashes in constant
     * time.
     *
     * @param hash the hash to check the hash(plaintext) for equality
     * @param plaintext the plaintext to be hashed
     * @param callback true if equal
     */
    verify: (hash, plaintext, callback) => {
        module.exports.password(plaintext, result => {
            callback(result === hash); // todo constant time compare
        });
    }
};