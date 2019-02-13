/**
 * @author Robin Duda
 *
 * Adds the server API to an existing Hapi server object.
 */

const Jade = require('pug');
const Path = require('path');
const Config = require('../config').load('ldap');
const TwoFactor = require('../authentication/twofactor');
const Authentication = require('../authentication/auth');

module.exports = {

    /**
     * Adds routing for a Hapi server to implement the 'Server API'.
     *
     * @param server Hapi server to register routes on.
     */
    register: function (server) {

        server.route({
            method: 'POST',
            path: '/logout',

            handler(request, h) {
                h.state('token', null);
                return h.response().code(200);
            }
        });

        server.route({
            method: 'GET',
            path: '/login',
            config: {auth: false},

            handler(request, h) {
                return Jade.renderFile(
                    Path.resolve(__dirname, '../../public/login.jade'), {
                        "kbnVersion": Config['kbnVersion']
                    });
            }
        });

        server.route({
            method: 'GET',
            path: '/groups',

            handler(request, h) {
                return {groups: request.auth.credentials.groups};
            }
        });

        server.route({
            method: 'POST',
            path: '/login',
            config: {auth: false},
            handler(request, h) {
                const username = request.payload.username;
                const password = request.payload.password;
                const nonce = request.payload.nonce;

                Authentication.authenticate(username, password, (err, user) => {

                        if (err || !user) {
                            return h.response().code(401);
                        } else {

                            TwoFactor.verify(user.uid, nonce, (success, secret) => {

                                if (success) {
                                    return h.state('token', Authentication.signToken(user.uid, user.groups), Config.cookie).code(200);
                                } else if (secret.verified === true) {
                                    return h.response({"error": (nonce)}).code(406);
                                } else {
                                    return h.response(TwoFactor.create(user.uid)).code(406);
                                }
                            });

                        }
                    }
                );
            }
        });
    }
};
