const Assert = require('assert');
const Filter = require('../../src/api/filter');
const Authentication = require('../../src/authentication/auth');

describe('Filter - Route proxying and resource filtering', () => {

    it('Should deny access for indices not a member of.', () => {
        Assert.equal(Filter.authorizedIndex('index', ['']), false);
        Assert.equal(Filter.authorizedIndex(['index'], ['']), false);
    });

    it('Should allow access to indices which am a member of.', () => {
        Assert.equal(Filter.authorizedIndex(['index'], ['index']), true);
        Assert.equal(Filter.authorizedIndex('index', ['index']), true);
    });

    it('Should accept any searches that do not specify index.', () => {
        var token = Authentication.signToken('uid', []);
        var payload = new Buffer('{}\n{}');
        var request = Filter.handleSearch({
            bodyContent: payload,
            headers: {
                cookie: 'token=' + token
            }
        });

        Assert.equal(request.bodyContent.toString(), payload.toString());
    });

    it('Should return empty request when token is invalid.', () => {
        var token = Authentication.signToken('uid', []);
        var request = Filter.handleSearch({
            bodyContent: new Buffer('{"index":"secret"}\n{}'),
            headers: {
                cookie: 'token=' + token
            }
        });

        Assert.equal(request.bodyContent.toString(), '{}');
    });

    it('Should return request when token is valid for given index', () => {
        var payload = new Buffer('{"index":"secret"}');
        var token = Authentication.signToken('uid', ['secret']);
        var request = Filter.handleSearch({
            bodyContent: payload,
            headers: {
                cookie: 'token=' + token
            }
        });

        Assert.equal(request.bodyContent.toString(), payload.toString());
    });

});
