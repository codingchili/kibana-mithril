const Assert = require('assert');
const fs = require('fs');
const File = require('../../src/authentication/file');
const Mock = require('../mock/helper');
const Config = require('../../src/config').load('file');

describe('Tests storing/loading user data from disk', () => {

    before((done) => {
        File.create(Mock.USERNAME, Mock.PASSWORD, () => {
            done();
        });
    });

    it('loads user data on startup', (done) => {
        File.authenticate(Mock.USERNAME, Mock.PASSWORD, (err) => {
            Assert.equal(err, null);
            done();
        });
    });

    it('saves user data on modification', (done) => {
        fs.unlinkSync(Config.filename);
        File.create(Mock.USERNAME, Mock.PASSWORD, () => {
            Assert.ok(fs.existsSync(Config.filename));
           done();
        });
    });

});