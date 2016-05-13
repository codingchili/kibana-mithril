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
const Config = require('./config').load('two-factor');

var secrets = {};

module.exports = {

  verify: function (username, token) {
    if (!secrets[username]) return false;

    var verified = Speakeasy.totp.verify({
      secret: secrets[username].token.base32,
      encoding: 'base32',
      token: token
    });

    if (verified)
      secrets[username].verified = true;

    return verified;
  },

  create: function (username) {
    secrets[username] = {
      token: Speakeasy.generateSecret({length: Config.length}),
      verified: false
    };

    return {
      text: secrets[username].token.base32,
      svg: QR.imageSync(secrets[username].token.otpauth_url, {type: 'svg'})
    };
  },

  generate: function (username) {
    return Speakeasy.totp({
      secret: secrets[username].token.base32,
      encoding: 'base32'
    })
  },

  reset: function() {
    secrets = {};
  },

  enabled: function (username) {
    var secret = secrets[username];

    return (secret && secret.verified) ? true : false;
  }
};

