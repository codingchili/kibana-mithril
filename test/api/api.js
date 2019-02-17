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

describe('Server API Routing', () => {

    before(async () => {
        const server = new Hapi.Server({
            host: 'localhost',
            port: PORT
        });

        let plugin = index({
            Plugin: class {
                constructor(plugin) {
                    this.init = plugin.init;
                }
            }
        });

        await plugin.init(server, {});
        await server.start();
    });

    it('Should deliver the login page on /mithril', (done) => {
        Request
            .get(url('mithril'))
            .on('response', (response) => {
                Assert.equal(response.statusCode, 200);
                done();
            });
    });

    it('Should accept requests with valid authentication token.', (done) => {
        Request.cookie('');

        Request
            .post({
                uri: url('logout'),
                headers: {
                    Cookie: "token=" + Authentication.signToken('user', ['group1'])
                }
            }).on('response', (response) => {
                Assert.equal(response.statusCode, 200);
                done();
        });
    });

    it('Should redirect with 302 on authentication invalid.', (done) => {
        Request.cookie('');

        Request
            .post({
                uri: url('logout'),
                headers: {
                    Cookie: "token=invalid"
                }
            }).on('response', (response) => {
            Assert.equal(response.statusCode, 302);
            done();
        });
    });

    it('Should redirect with 302 on authentication missing.', (done) => {
        Request.cookie('');

        Request
            .post({
                uri: url('logout'),
                headers: {
                    Cookie: ""
                }
            }).on('response', (response) => {
            Assert.equal(response.statusCode, 302);
            done();
        });
    });

});
