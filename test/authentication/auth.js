/**
 * @author Robin Duda
 *
 * Tests authentication using an LDAP server.
 * Tests authentication using File.
 */


const Assert = require('assert');
const Mock = require('../mock/helper');
const Authentication = require('../../src/authentication/auth');


suite('Tests authentication storage providers.', function () {
    let implementations = ['file', 'ldap', 'mongodb'];

    implementations.forEach(implementation => {
        describe('Authentication with ' + implementation, function () {

            before((done) => {
                Mock.init(() => {
                    Authentication.setStorage(implementation);
                    done();
                });
            });

            it('Should bind successfully with a client.', function (done) {
                Authentication.authenticate(Mock.USERNAME, Mock.PASSWORD, function (err, user) {
                    Assert.equal(user.uid, Mock.USERNAME);
                    Assert.equal(err, null);
                    done();
                });
            });

            it('Should fail to bind with an user using wrong password.', function (done) {
                Authentication.authenticate(Mock.USERNAME, Mock.PASSWORD_WRONG, function (err, user) {
                    Assert.notEqual(err, null);
                    done();
                });
            });

            it('Should fail to bind with a user that do not exist.', function (done) {
                Authentication.authenticate('missing', Mock.PASSWORD, function (err, user) {
                    Assert.equal(user, null);
                    Assert.notEqual(err, null);
                    done();
                });
            });

            it('Should retrieve all the groups an user is member of.', function (done) {
                Authentication.authenticate(Mock.USERNAME, Mock.PASSWORD, function (err, user) {
                    Assert.equal(err, null);
                    Assert.equal(user.groups.length, 1);
                    done();
                });
            });

            it('Should create and verify a valid token', function () {
                let token = Authentication.signToken('id', ['group']);
                token = Authentication.verifyToken(token);

                Assert.equal('id', token.id);
                Assert.equal('group', token.groups[0]);
            });

            it('Should fail to verify an invalid token', function () {
                let token = "error";

                try {
                    Authentication.verifyToken(token);
                    Assert.equal(true, false, 'Error expected.');
                } catch (err) {
                }
            });
        });
    });
});