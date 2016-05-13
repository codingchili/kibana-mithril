/**
 * @author Robin Duda
 *
 * Tests the generation and verification of TOTP tokens.
 */

const TwoFactor = require('../lib/twofactor');
const Assert = require('assert');

const USERNAME = 'test-username';

describe('Two-factor authentication', function () {

  afterEach(function () {
    TwoFactor.reset();
  });

  it('Should generate a qr-svg image.', function () {
    var svg = TwoFactor.create(USERNAME).svg;
    Assert.equal(true, svg.startsWith('<svg'));
  });

  it('Should generate a text-based secret.', function () {
    var secret = TwoFactor.create(USERNAME).text;
    Assert.notEqual(null, secret);
  });

  it('Should not bind to a secret before verifying once.', function () {
    TwoFactor.create(USERNAME);
    Assert.equal(false, TwoFactor.enabled(USERNAME), 'Should not be enabled before verification.');

    TwoFactor.verify(USERNAME, 'invalid-token');
    Assert.equal(false, TwoFactor.enabled(USERNAME), 'Should not be enabled before verification.');

    TwoFactor.verify(USERNAME, TwoFactor.generate(USERNAME));
    Assert.equal(true, TwoFactor.enabled(USERNAME), 'Should be enabled after verifying.');
  });

  it('Should recognize when a secret does not exist.', function () {
    var noexist = TwoFactor.enabled(USERNAME);

    TwoFactor.create(USERNAME);
    TwoFactor.verify(USERNAME, TwoFactor.generate(USERNAME));

    var exist = TwoFactor.enabled(USERNAME);

    Assert.equal(false, noexist);
    Assert.equal(true, exist);
  });

  it('Should verify a valid token from a secret.', function () {
    TwoFactor.create(USERNAME);
    Assert.equal(true, TwoFactor.verify(USERNAME, TwoFactor.generate(USERNAME)));
  });

  it('Should reject a token from an invalid secret.', function () {
    TwoFactor.create(USERNAME);
    Assert.equal(false, TwoFactor.verify(USERNAME, 'INVALID'));
  });

  it('Should bind secrets to usernames.', function () {
    TwoFactor.create(USERNAME);
    var token = TwoFactor.generate(USERNAME);

    Assert.equal(false, TwoFactor.verify('other_user', token));
  });
});
