/**
 * @author Robin Duda
 *
 * Handles two-factor authentication using TOTP, generates
 * a qr-code or base32 string to represent the shared secret.
 *
 * Secrets are not bound to an username before it is verified
 * once, to ensure that the user has received the secret.
 */

const Speakeasy = require('speakeasy');
const QR = require('qr-image');
let Config = require('../config');
const Storage = require('./' + Config.get().storage);
Config = Config.load('two-factor');

module.exports = {

    /**
     * Verifies a 2-FA key with the current timeframe and
     * the stored secret for the given user.
     *
     * @param username used to identify the correct secret.
     * @param token supplied by the authenticating party.
     * @param callback Function {success, secret}
     */
    verify: function (username, token, callback) {
        if (Config.enabled) {
            Storage.getSecret(username, (exist, secret) => {

                if (!exist) {
                    callback(false, {verified: false});
                } else {
                    let success = Speakeasy.totp.verify({
                            secret: secret.key,
                            encoding: 'base32',
                            token: token
                        }
                    );
                    if (success) {
                        secret.verified = true;
                        Storage.setSecret(username, secret);
                    }
                    callback(success, secret);
                }
            });
        } else {
            callback(true);
        }
    },

    /**
     * Creates a new 2-FA secret for the given username.
     *
     * @param username to create the secret for.
     * @returns {{text: *, svg: *}}
     */
    create: function (username) {
        let key = Speakeasy.generateSecret({length: Config.length});
        Storage.setSecret(username, {key: key.base32, verified: false});

        return {
            text: key.base32,
            svg: QR.imageSync(key.otpauth_url, {type: 'svg'})
        };
    },

    /**
     * Determines if an user has enabled its 2-FA secret by logging
     * in at least once.
     *
     * @param username specifies the user.
     * @param callback Function {Boolean}
     */
    active: function (username, callback) {
        Storage.getSecret(username, (enabled, secret) => {
            callback(enabled, secret);
        });
    },

    /**
    * Return true if 2FA is enabled.
    */
    enabled: () => {
        return Config.enabled;
    },

    /**
     * Generates a new key from a given secret.
     *
     * @param key as the secret base32 encoded.
     * @returns {String} as a valid OTP.
     */
    generate: function (key) {
        return Speakeasy.totp({
            secret: key,
            encoding: 'base32'
        });
    }
};

