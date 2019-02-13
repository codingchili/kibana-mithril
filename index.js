/**
 * @author Robin Duda
 *
 * Kibana 6 LDAP authentication plugin for multi-user mode.
 *
 * Requires all routes to carry a valid JWT token as a cookie
 * or be redirected to a login page. A filter and proxy is
 * added to the Kibana Hapi server to ensure query permissions
 * on indices and to hijack queries for stored dashboards/queries/graphs
 * so that the request may be processed in a context-aware manner.
 */

const Filter = require('./src/api/filter');
const API = require('./src/api/api');
const Config = require('./src/config').load('authentication');
require('./src/authentication/auth');


module.exports = async function (kibana) {
    console.log(`kibana authentication plugin by codingchili@github init!`);

    return await kibana.Plugin({
        name: 'kbn-authentication-plugin',
        require: [],
        uiExports: {
            app: {
                title: 'Authentication',
                description: 'Authentication plugin',
                main: 'plugins/kbn-authentication-plugin/script/app',
                icon: 'plugins/kbn-authentication-plugin/img/icon.png'
            }
        },

        config(Joi) {
            return Joi.object({
                enabled: Joi.boolean().default(true),
            }).default()
        },

        async init(server, options) {

            Filter.proxy();
            API.register(server);


            // Login based scheme as a wrapper for JWT scheme.
            server.auth.scheme("login", function (server, options) {
                return {
                    authenticate: async function(request, h) {
                        try {
                            let credentials = await server.auth.test("jwt", request);
                            return h.authenticated({credentials: credentials});
                        } catch (e) {
                            return h.redirect("/login").takeover();
                        }
                    }
                }
            });

            // JWT is used to provide authorization through JWT-cookies.
            try {
                await server.register(require('hapi-auth-jwt2'));

                // needs to be registered so we can reference it from our custom strategy.
                server.auth.strategy('jwt', 'jwt', {
                    key: Config.secret,
                    validate: validate,
                    verifyOptions: {algorithms: ['HS256']}
                });

                server.auth.strategy("login", "login", {});
                server.auth.default("login");
            } catch (err) {
                throw err;
            }
        }
    });
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
