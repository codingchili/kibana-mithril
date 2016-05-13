/**
 * @author Robin Duda
 *
 * Kibana 5.0.0-alpha LDAP authentication plugin.
 *
 * Requires all routes to carry a valid JWT token as a cookie
 * or be redirected. Target of redirection is the login page
 * added to the server API of Kibana. Server API requests are
 * routed through a validation method, which verifies that the
 * token grants query access to the index within the query.
 */

const HapiJWT = require('hapi-auth-jwt2');
const JWT = require('jsonwebtoken');
const Jade = require('pug');
const TwoFactor = require('./lib/twofactor');
const LDAP = require('./lib/ldap');
const Filter = require('./lib/filter');
const Path = require('path');
const Config = require('./lib/config').load('login');

const SECRET = Config.secret;
const cookieOptions = Config.cookie;

module.exports = function (kibana) {

  return new kibana.Plugin({
    init(server, options) {

      Filter.register(server);

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
          key: SECRET,
          validateFunc: validate,
          verifyOptions: {algorithms: ['HS256']}
        })
      });

      server.auth.strategy("login", "login", true);

      server.route({
        method: 'GET',
        path: '/login',
        config: {auth: false},
        handler(request, reply) {
          reply(Jade.renderFile(Path.resolve(__dirname, 'views/login.jade')));
        }
      });

      server.route({
        method: 'POST',
        path: '/login',
        config: {auth: false},
        handler(request, reply) {
          var username = request.payload.username;
          var password = request.payload.password;
          var nonce = request.payload.nonce;


          LDAP.authenticate(username, password, function (err, user) {
              if (err || !user) {
                reply().code(401);
              } else if (TwoFactor.verify(user.dn, nonce)) {
                reply().state('token', signToken(user.dn), cookieOptions);
              } else {
                // If 2FA fails and a previously used shared secret exists,
                // return with error set. If no previously shared secret exists
                // or the previosuly shared secret never has been used -> recreate.
                reply(
                  (TwoFactor.enabled(user.dn) ? {"error": (nonce)} : TwoFactor.create(user.dn)))
                  .code(406);
              }
            }
          );
        }
      });
    }
  });
};

function signToken(user) {
  return JWT.sign(
    {
      username: user.name,
      expiry: new Date().getTime() + (7 * 24 * 60 * 60 * 1000)
    },
    SECRET);
}

/**
 * Verifies that the token carried by the request grants access to
 * the requested page or API/Index resource.
 *
 * @param token JWT token carried in a cookie.
 * @param request To be validated.
 * @param callback {error, success}
 */
function validate(token, request, callback) {
  var valid = (new Date().getTime() < token.expiry);

  Filter.access(request, token.username);

  callback(null, valid);
}
