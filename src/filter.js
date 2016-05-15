/**
 * @author Robin Duda
 *
 * Adds proxying and filtering to an existing Hapi server
 * in order to be able to modify requests based on
 * authorization before they are routed.
 */

module.exports = {

  /**
   * Adds proxying in front of an existing Hapi server.
   * Allows requests to be modified by permissions before
   * they are routed.
   *
   * @param server to be proxied.
     */
  proxy: function (server) {

  },

  /**
   * Determines if a request should be blocked based on the
   * access level of the sender.
   *
   * @param request specifying the resource and query.
   * @param username of the user requesting the resource.
     */
  access: function (request, username) {
    return true;
  },

  /**
   * Filters a resource based on the access level of the
   * sender.
   *
   * @param server the server to add postrouting to.
     */
  resource: function (server) {
    
  }
};
