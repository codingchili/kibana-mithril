/**
 * @author Robin Duda
 *
 * Tests routing added by the Server API.
 */

const Assert = require('assert');
const Hapi = require('hapi');
const Request = require('request');
const API = require('../../src/api/api');
const index = require('../../index');
//require('../mock/ldap');
const Authentication = require('../../src/authentication/auth');

const PORT = 5810;

function url(resource) {
    return 'http://127.0.0.1:' + PORT + '/' + resource;
}

describe('Server API Routing', function () {

    before(function (done) {
        const server = new Hapi.Server();
        server.connection({port: PORT});

        index({
            Plugin: function (plugin) {
                plugin.init(server, {});
            }
        });

        server.start((err) => {
            if (err)
                throw err;

            done();
        });
    });

    it('Should deliver the login page on /login', function (done) {
        Request
            .get(url('login'))
            .on('response', function (response) {
                Assert.equal(response.statusCode, 200);
                done();
            });
    });

    it('Should accept requests with valid authentication token.', function (done) {
        Request.cookie('');

        Request
            .post({
                uri: url('logout'),
                headers: {
                    Cookie: "token=" + Authentication.signToken('user', ['group1'])
                }
            }).on('response', function (response) {
            Assert.equal(response.statusCode, 200);
            done();
        });
    });

    it('Should redirect with 302 on authentication invalid.', function (done) {
        Request.cookie('');

        Request
            .post({
                uri: url('logout'),
                headers: {
                    Cookie: "token=invalid"
                }
            }).on('response', function (response) {
            Assert.equal(response.statusCode, 302);
            done();
        });
    });

    it('Should redirect with 302 on authentication missing.', function (done) {
        Request.cookie('');

        Request
            .post({
                uri: url('logout'),
                headers: {
                    Cookie: ""
                }
            }).on('response', function (response) {
            Assert.equal(response.statusCode, 302);
            done();
        });
    });

});
