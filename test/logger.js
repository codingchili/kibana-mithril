/**
 * @author Robin Duda
 *
 * Tests the loading and reading of the configuration file.
 */

const Assert = require('assert');
const Logger = require('../src/logger');

function source(forwarded) {
    return {
        ip: '127.0.0.1',
        forwarded: forwarded
     }
}

let calls = 0;


function writer() {
    return {
        log: (line) => {
            calls += 1;
        }
    }
}


describe('Logging', () => {

    beforeEach(() => {
        calls = 0;
    });

    it('Log authentication success/fail', () => {
        Logger.writer(writer());

        Logger.succeededAuthentication('user', source());
        Logger.failedAuthentication('user', source());

        Assert.equal(2, calls);
    });

    it('Log 2FA success/fail', () => {
        Logger.writer(writer());

        Logger.failed2FA('user', source());
        Logger.succeeded2FA('user', source());

        Assert.equal(2, calls);
    });

    it('Log with X-Forwarded-For header', () => {
        Logger.writer(writer());
        Logger.unauthorized('/api/routes/1.1.1.1', source('1.1.1.1'));
        Assert.equal(1, calls);
    });

    it('Log blocked access', () => {
        Logger.writer(writer());
        Logger.unauthorized('/api/routes/1.1.1.1', source());
        Assert.equal(1, calls);
    });

});
