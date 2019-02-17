/**
 * @author Robin Duda
 *
 * Adds the server API to an existing Hapi server object.
 */

const Jade = require('pug');
const Path = require('path');
const Config = require('../config');
const TwoFactor = require('../authentication/twofactor');
const Authentication = require('../authentication/auth');

const COOKIE_NAME = 'token';

module.exports = {

    /**
     * Adds routing for a Hapi server to implement the 'Server API'.
     *
     * @param server Hapi server to register routes on.
     */
    register: async function (server) {
        let basePath = server.config().get('server.basePath');

        server.route({
            method: 'POST',
            path: '/logout',

            handler(request, h) {
                return h.response().unstate(COOKIE_NAME, cookie()).code(200);
            }
        });

        server.route({
            method: 'GET',
            path: '/mithril',
            config: {auth: false},

            handler(request, h) {
                return Jade.renderFile(
                    Path.resolve(__dirname, '../../public/mithril.pug'), {
                        'kbnVersion': Config.version(),
                        'basePath': basePath
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
            path: '/mithril',
            config: {auth: false},
            handler(request, h) {
                const username = request.payload.username;
                const password = request.payload.password;
                const nonce = request.payload.nonce;

                return new Promise((resolve, reject) => {
                    Authentication.authenticate(username, password, (err, user) => {

                        if (err || !user) {
                            resolve(h.response().code(401));
                        } else {
                            TwoFactor.verify(user.uid, nonce, (success, secret) => {
                                if (success) {
                                    // 2FA key verified successfully.
                                    h.state(COOKIE_NAME, Authentication.signToken(user.uid, user.groups), cookie());
                                    resolve(h.response().code(200));
                                } else {
                                    if (secret.verified === true) {
                                        // secret already verified return an error.
                                        resolve(h.response({"error": (nonce)}).code(406));
                                    } else {
                                        // secret is not verified - return a new qr/code.
                                        resolve(h.response(TwoFactor.create(user.uid)).code(406));
                                    }
                                }
                            });
                        }
                    });
                });
            }
        });

        // Login based scheme as a wrapper for JWT scheme.
        server.auth.scheme("mithril", (server, options) => {
            return {
                authenticate: async (request, h) => {
                    try {
                        let credentials = await server.auth.test("jwt", request);
                        return h.authenticated({credentials: credentials});
                    } catch (e) {
                        return h.redirect(`${basePath}/mithril`).takeover();
                    }
                }
            }
        });

        // JWT is used to provide authorization through JWT-cookies.
        try {
            await server.register(require('hapi-auth-jwt2'));

            // needs to be registered so we can reference it from our custom strategy.
            server.auth.strategy('jwt', 'jwt', {
                key: Authentication.secret(),
                validate: validate,
                verifyOptions: {algorithms: ['HS256']}
            });

            server.auth.strategy("mithril", "mithril", {});

            // hack to override the default strategy that is already set by x-pack.
            server.auth.settings.default = null;

            server.auth.default("mithril");
        } catch (err) {
            throw err;
        }

    }
};


/**
 * Verifies that the token carried by the request grants access to
 * the requested page or API/Index resource.
 *
 * @param token JWT token carried in a cookie.
 * @param request To be validated.
 * @param callback {error, success}
 */
function validate(token, h) {
  let valid = new Date().getTime() < token.expiry;
  return {isValid: valid};
}


function cookie() {
    return Config.load('authentication').cookie;
}