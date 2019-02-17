/**
 * @author Robin Duda
 *
 * Tests the hashing of passwords.
 */


const Assert = require('assert');
const Mock = require('../mock/helper');
const Hash = require('../../src/authentication/hash');

describe('Password hashing', () => {

    it('Should successfully hash a password.', (done) => {
        Hash.password(Mock.PASSWORD, (hash) => {
            Assert.notEqual(hash, null);
            done();
        });
    });

    it('Should successfully verify plaintext against hash.', (done) => {
        Hash.password(Mock.PASSWORD, (hash) => {
            Hash.verify(hash, Mock.PASSWORD, result => {
                Assert.ok(result);
                done();
            });
        });
    });

    it('Should fail to verify non-matching plaintext to hash..', (done) => {
        Hash.password(Mock.PASSWORD, (hash) => {
            Hash.verify(hash, Mock.PASSWORD_WRONG, result => {
                Assert.ok(!result);
                done();
            });
        });
    });

    it('Hash must not be equal to plaintext.', (done) => {
        Hash.password(Mock.PASSWORD, (hash) => {
            Assert.notEqual(Mock.PASSWORD, hash);
            done();
        });
    });
});
