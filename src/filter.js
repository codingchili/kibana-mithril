/**
 * @author Robin Duda
 *
 * Adds proxying and filtering to an existing Hapi server
 * in order to be able to modify requests based on
 * authorization before they are routed.
 */

const Querystring = require('querystring');
const Express = require('express');
const Proxy = require('express-http-proxy');
const Authentication = require('./authentication');
const Config = require('./config').load('proxy');

var app = Express();

module.exports = {

  /**
   * Adds proxying in front of an existing Hapi server.
   * Allows requests to be modified by permissions before
   * they are routed.
   */
  proxy: function () {

    app.use('/', Proxy(Config.remote, {

      filter: function (req, res) {
        return true;
      },

      decorateRequest: function (req) {

        if (req.path.startsWith('/elasticsearch/_msearch')) {
          return module.exports.handleSearch(req);
        } else {
          return req;
        }
      },

      forwardPath: function (req) {
        return require('url').parse(req.url).path;
      }

    }));

    app.listen(Config.port);
  },

  /**
   * Handles the filtering of a search endpoint in the kibana server API.
   * User group membership are matched against the queried index.
   *
   * @param req the request to be inspected contains user groups and requested index.
   * @returns {*}
     */
  handleSearch: function (req) {
    var query = getQueryList(req.bodyContent);
    var response = '';
    var authorized = true;
    try {
      var token = Authentication.verifyToken(Querystring.parse(req.headers.cookie).token);

      for (var i = 0; i < query.length; i++) {
        var search = JSON.parse(query[i]);

        if (search.index) {
          if (!module.exports.authorizedIndex(search.index, token.groups)) {
            authorized = false;
          }
        }
        response += JSON.stringify(search) + '\n';
      }
    } catch (err) {
      authorized = false;
    }

    if (authorized) {
      req.bodyContent = new Buffer(response, 'utf8')
    } else {
      req.bodyContent = new Buffer('{}');
    }

    return req;
  },

  /**
   * Checks if a given index is contained within a list of groups.
   *
   * @param index the name of the index.
   * @param groups an array of groups to look in.
   * @returns {boolean}
     */
  authorizedIndex: function (index, groups) {
    var authorized = true;
    index = (index instanceof Array) ? index : [index];

    for (var i = 0; i < index.length; i++) {
      var member = false;

      for (var k = 0; k < groups.length; k++) {
        if (index[i] === groups[k])
          member = true;
      }

      if (!member)
        authorized = false;
    }

    return authorized;
  }
};

/**
 * Deconstructs a message that may contain multiple non-joined json
 * query objects, separated by newline.
 *
 * @param content a string representing an unknown number of json objects.
 * @returns Array of strings with one item per json object.
 */
function getQueryList(content) {
  var list = content.toString().split('\n');

  if (list.length === 0)
    return [content.toString()];
  else {
    list.splice(-1, 1);
    return list;
  }
}
