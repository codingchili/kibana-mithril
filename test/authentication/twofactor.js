/**
 * @author Robin Duda
 *
 * Tests the generation and verification of TOTP tokens.
 */

const TwoFactor = require('../../src/authentication/twofactor');
const Assert = require('assert');

const USERNAME = 'test-username';

describe('Two-factor authentication', () => {

    it('Should generate a qr-svg image.', () => {
        let svg = TwoFactor.create(USERNAME).svg;
        Assert.equal(svg.startsWith('<svg'), true);
    });

    it('Should generate a text-based secret.', () => {
        let secret = TwoFactor.create(USERNAME).text;
        Assert.notEqual(secret, null);
    });

    it('Should not bind to a secret before verifying once.', () => {
        TwoFactor.create(USERNAME);

        TwoFactor.verify(USERNAME, null, (result, secret) => {
            Assert.equal(secret.verified, false);
            Assert.equal(result, false);

            TwoFactor.verify(USERNAME, TwoFactor.generate(secret.key), (result) => {
                Assert.equal(result, true);

                TwoFactor.enabled(USERNAME, (enabled) => {
                    Assert.equal(enabled, true);
                })
            });

        });
    });

    it('Should verify a valid token from a secret.', () => {
        let secret = TwoFactor.create(USERNAME);
        let token = TwoFactor.generate(secret.text);

        TwoFactor.verify(USERNAME, token, (success) => {
            Assert.equal(success, true);
        });

    });

    it('Should reject a token from an invalid secret.', () => {
        TwoFactor.create(USERNAME);

        TwoFactor.verify(USERNAME, 'invalid', (success) => {
            Assert.equal(success, false);
        });
    });

    it('Should bind secrets to usernames.', () => {
        let secret = TwoFactor.create(USERNAME);
        let token = TwoFactor.generate(secret.key);

        TwoFactor.verify('other-user', token, (success) => {
            Assert.equal(success, false);
        });
    });


    it('Should not require 2FA when disabled', (done) => {

        TwoFactor.create(USERNAME);

        // disable 2FA
        require('../../src/config').get()['two-factor'].enabled = false;

        // attempt to verify with a missing nonce
        TwoFactor.verify(USERNAME, null, (success) => {
           Assert.ok(success);
           done();
        });
    });
});
