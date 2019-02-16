/**
 * @author Robin Duda
 *
 * Tests authentication using an LDAP server.
 * Tests authentication using File.
 */


const Assert = require('assert');
const Mock = require('../mock/helper');
const Authentication = require('../../src/authentication/auth');


suite('Tests authentication storage providers.', () => {
    let implementations = ['file', 'ldap', 'mongodb'];

    implementations.forEach(implementation => {
        describe('Authentication with ' + implementation, () => {

            before((done) => {
                Mock.init(() => {
                    Authentication.setStorage(implementation);
                    done();
                });
            });

            it('Should bind successfully with a client.', (done) =>{
                Authentication.authenticate(Mock.USERNAME, Mock.PASSWORD, (err, user) => {
                    Assert.equal(user.uid, Mock.USERNAME);
                    Assert.equal(err, null);
                    done();
                });
            });

            it('Should fail to bind with an user using wrong password.', (done) => {
                Authentication.authenticate(Mock.USERNAME, Mock.PASSWORD_WRONG, (err, user) => {
                    Assert.notEqual(err, null);
                    done();
                });
            });

            it('Should fail to bind with a user that do not exist.', (done) => {
                Authentication.authenticate('missing', Mock.PASSWORD, (err, user) => {
                    Assert.equal(user, null);
                    Assert.notEqual(err, null);
                    done();
                });
            });

            it('Should retrieve all the groups an user is member of.', (done) => {
                Authentication.authenticate(Mock.USERNAME, Mock.PASSWORD, (err, user) => {
                    Assert.equal(err, null);
                    Assert.equal(user.groups.length, 1);
                    done();
                });
            });

            it('Should create and verify a valid token', () => {
                let token = Authentication.signToken('id', ['group']);
                token = Authentication.verifyToken(token);

                Assert.equal('id', token.id);
                Assert.equal('group', token.groups[0]);
            });

            it('Should fail to verify an invalid token', () => {
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