/**
 * @author Robin Duda
 *
 * Tests the hashing of passwords.
 */


const Assert = require('assert');
const Mock = require('../mock/helper');
const Hash = require('../../src/authentication/hash');

describe('Password hashing', function () {

    it('Should successfully hash a password.', function (done) {
        Hash.password(Mock.PASSWORD, function (hash) {
            Assert.notEqual(hash, null);
            done();
        });
    });

    it('Should successfully verify plaintext against hash.', function (done) {
        Hash.password(Mock.PASSWORD, function (hash) {
            Hash.verify(hash, Mock.PASSWORD, result => {
                Assert.ok(result);
                done();
            });
        });
    });

    it('Should fail to verify non-matching plaintext to hash..', function (done) {
        Hash.password(Mock.PASSWORD, function (hash) {
            Hash.verify(hash, Mock.PASSWORD_WRONG, result => {
                Assert.ok(!result);
                done();
            });
        });
    });

    it('Hash must not be equal to plaintext.', function (done) {
        Hash.password(Mock.PASSWORD, function (hash) {
            Assert.notEqual(Mock.PASSWORD, hash);
            done();
        });
    });
});
