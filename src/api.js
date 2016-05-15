/**
 * @author Robin Duda
 *
 * Adds the server API to an existing Hapi server object.
 */

const JWT = require('jsonwebtoken');
const Jade = require('pug');
const Path = require('path');
const Config = require('./config').load('login');
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

              TwoFactor.verify(user.dn, nonce, function (success, secret) {

                if (success) {
                  reply().state('token', module.exports.signToken(user.dn), Config.cookie);
                } else if (secret.verified === true) {
                  reply({"error": (nonce)}).code(406);
                } else {
                  reply(TwoFactor.create(user.dn)).code(406);
                }
              });

            }
          }
        );
      }
    });
  },

  signToken: function (id) {
    return JWT.sign(
      {
        id: id,
        expiry: new Date().getTime() + (7 * 24 * 60 * 60 * 1000)
      },
      Config.secret);
  }
};
