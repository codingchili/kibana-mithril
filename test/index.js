/**
 * @author Robin Duda
 *
 * Tests the added routes.
 */

const Assert = require('assert');

describe('Injected server API routes', function () {

  before(function() {
    // todo setup the Hapi server, run the register in Index on the Hapi server
  });

  it('Should deliver the login page on /login', function () {
    // todo node request: test /login for 200 OK
  });

  it('Should deliver the login page for all unauthenticated requests.', function () {
    // todo node request: test /other route to redirect to /login
  });

  it('Should allow authenticated requests to pass.', function () {
    // todo sign a cookie and send with the request. using JWT
  });

  it('Should reject a login attempt on /login post.', function () {
    // todo document why this test will never succeed.
  });

});
