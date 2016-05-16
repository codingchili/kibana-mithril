/**
 * @author Robin Duda
 *
 * Adds the server API to an existing Hapi server object.
 */

const Jade = require('pug');
const Path = require('path');
const Config = require('./config').load('authentication');
const TwoFactor = require('./twofactor');
const Authentication = require('./authentication');

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

      handler(request, reply) {
        reply().state('token', null);
      }
    });

    server.route({
      method: 'GET',
      path: '/login',
      config: {auth: false},

      handler(request, reply) {
        reply(Jade.renderFile(
          Path.resolve(__dirname, '../public/login.jade'), {
            "kbnVersion": Config['kbnVersion']
          }));
      }
    });

    server.route({
      method: 'GET',
      path: '/groups',

      handler(request, reply) {
        reply({groups: request.auth.credentials.groups});
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

        Authentication.ldap(username, password, function (err, user) {

            if (err || !user) {
              reply().code(401);
            } else {

              TwoFactor.verify(user.uid, nonce, function (success, secret) {

                if (success) {
                  reply().state('token', Authentication.signToken(user.uid, user.groups), Config.cookie);
                } else if (secret.verified === true) {
                  reply({"error": (nonce)}).code(406);
                } else {
                  reply(TwoFactor.create(user.uid)).code(406);
                }
              });

            }
          }
        );
      }
    });
  }
};
