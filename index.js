/**
 * @author Robin Duda
 *
 * Kibana 5.4.2 LDAP authentication plugin for multi-user mode.
 *
 * Requires all routes to carry a valid JWT token as a cookie
 * or be redirected to a login page. A filter and proxy is
 * added to the Kibana Hapi server to ensure query permissions
 * on indices and to hijack queries for stored dashboards/queries/graphs
 * so that the request may be processed in a context-aware manner.
 */

const HapiJWT = require('hapi-auth-jwt2');
const Filter = require('./src/api/filter');
const API = require('./src/api/api');
const Config = require('./src/config').load('authentication');
const Authentication = require('./src/authentication/auth');


module.exports = function (kibana) {
  console.log('kibana authentication plugin by codingchili@github init!');

  return new kibana.Plugin({

    uiExports: {
      app: {
        title: 'Authentication',
        description: 'Authentication management plugin',
        main: 'plugins/kbn-authentication-plugin/script/app',
        icon: 'plugins/kbn-authentication-plugin/img/icon.png'
      }
    },

    init(server, options) {

      Filter.proxy();
      API.register(server);

      // Login based scheme as a wrapper for JWT scheme.
      server.auth.scheme("login", function (server, options) {
        return {
          authenticate: function (request, reply) {
            server.auth.test("jwt", request, function (err, credentials) {
              if (err) {
                reply.redirect("/login")
              } else {
                reply.continue({credentials: credentials});
              }
            });
          }
        }
      });

      // JWT is used to provide authorization through JWT-cookies.
      server.register(HapiJWT, function (err) {
        server.auth.strategy('jwt', 'jwt', {
          key: Config.secret,
          validateFunc: validate,
          verifyOptions: {algorithms: ['HS256']}
        })
      });

      server.auth.strategy("login", "login", true);
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
function validate(token, request, callback) {
  callback(null, (new Date().getTime() < token.expiry));
}
