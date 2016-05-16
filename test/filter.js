const Assert = require('assert');
const Filter = require('../src/filter');
const Authentication = require('../src/authentication');

describe('Filter - Route proxying and resource filtering', function () {

  it('Should deny access for indices not a member of.', function () {
    Assert.equal(Filter.authorizedIndex('index', ['']), false);
    Assert.equal(Filter.authorizedIndex(['index'], ['']), false);
  });

  it('Should allow access to indices which am a member of.', function () {
    Assert.equal(Filter.authorizedIndex(['index'], ['index']), true);
    Assert.equal(Filter.authorizedIndex('index', ['index']), true);
  });

  it('Should accept any searches that do not specify index.', function () {
    var request = Filter.handleSearch({
      bodyContent: new Buffer("{}\n{}"),
      headers: {
        cookie: ""
      }
    });

    Assert.equal(new Buffer('{}').toString(), request.bodyContent.toString());
  });

  it('Should return empty request when token is invalid.', function () {
    var token = Authentication.signToken('uid', []);
    var request = Filter.handleSearch({
      bodyContent: new Buffer('{"index":"secret"}\n{}'),
      headers: {
        cookie: 'token=' + token
      }
    });

    Assert.equal(new Buffer('{}').toString(), request.bodyContent.toString());
  });

  it('Should return request when token is valid for given index', function () {
    var payload = new Buffer('{"index":"secret"}');
    var token = Authentication.signToken('uid', ['secret']);
    var request = Filter.handleSearch({
      bodyContent: payload,
      headers: {
        cookie: 'token=' + token
      }
    });

    Assert.equal(payload.toString() + '\n', request.bodyContent.toString());
  });

});
