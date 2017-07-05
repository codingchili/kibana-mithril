/**
 * @author Robin Duda
 *
 * Tests the generation and verification of TOTP tokens.
 */

const TwoFactor = require('../../src/authentication/twofactor');
const Assert = require('assert');

const USERNAME = 'test-username';

describe('Two-factor authentication', function () {

    it('Should generate a qr-svg image.', function () {
        let svg = TwoFactor.create(USERNAME).svg;
        Assert.equal(svg.startsWith('<svg'), true);
    });

    it('Should generate a text-based secret.', function () {
        let secret = TwoFactor.create(USERNAME).text;
        Assert.notEqual(secret, null);
    });

    it('Should not bind to a secret before verifying once.', function () {
        TwoFactor.create(USERNAME);

        TwoFactor.verify(USERNAME, null, function (result, secret) {
            Assert.equal(secret.verified, false);
            Assert.equal(result, false);

            TwoFactor.verify(USERNAME, TwoFactor.generate(secret.key), function (result) {
                Assert.equal(result, true);

                TwoFactor.enabled(USERNAME, function (enabled) {
                    Assert.equal(enabled, true);
                })
            });

        });
    });

    it('Should verify a valid token from a secret.', function () {
        let secret = TwoFactor.create(USERNAME);
        let token = TwoFactor.generate(secret.text);

        TwoFactor.verify(USERNAME, token, function (success) {
            Assert.equal(success, true);
        });

    });

    it('Should reject a token from an invalid secret.', function () {
        TwoFactor.create(USERNAME);

        TwoFactor.verify(USERNAME, 'invalid', function (success) {
            Assert.equal(success, false);
        });
    });

    it('Should bind secrets to usernames.', function () {
        let secret = TwoFactor.create(USERNAME);
        let token = TwoFactor.generate(secret.key);

        TwoFactor.verify('other-user', token, function (success) {
            Assert.equal(success, false);
        });
    });
});
