const Authentication = require('./src/authentication/auth');
const Config = require('./src/config').get();


Authentication.setStorage(Config.storage);

if (process.argv.length === 4) {
    let user = process.argv[2];
    let password = process.argv[3];

    Authentication.create(user, password, done => {
        console.log('user ' + user + ' was added to storage (' + Config.storage + ')');
    });
} else {
    console.log('This utility adds a new user to the configured storage (' + Config.storage + ').');
    console.log('Usage: node adduser.js <username> <password>');
}