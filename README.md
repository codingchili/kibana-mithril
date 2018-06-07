# kbn-authentication-plugin [![Build Status](https://travis-ci.org/codingchili/kbn-authentication-plugin.svg?branch=master)](https://travis-ci.org/codingchili/kbn-authentication-plugin)
A plugin adds authentication to Kibana dashboards! [YouTube demo](https://www.youtube.com/watch?v=vvUdpPQhBjk)

![key setup](https://raw.githubusercontent.com/codingchili/kbn-authentication-plugin/master/key-setup.png)

#### Building the plugin
To check out the sources and build the plugin do the following
```
git clone https://github.com/codingchili/kbn-authentication-plugin
cd kbn-authentication-plugin
npm install
mocha test --recursive -u tdd
```
Note: if you are on linux and running kibana using x64 you must omit the --arch flag.

Perform the following steps to create an installable zip:
1. Set the kibana version in package.json, must match exactly.
1. move kbn-authentication-plugin into a folder named 'kibana'.
2. Create a zip file that includes the 'kibana' folder.
4. The plugin can then be installed with the kibana-plugin install command, see installing.

##### Dependencies

- NodeJS 8.11.2+
- NPM
- MS Build tools / Unix build tools
- Python 2.7

To compile the binary module argon2-ffi build tools are requried, install with
```
windows: 
  npm install --global --production windows-build-tools
unix:    
  sudo apt-get install build-essential libssl-dev libffi-dev python-dev
```
This installs MS build tools and python 2.7 and is required for node-gyp to work.

#### Installing
To install the plugin use the kibana-plugin utility, example:
```
./kibana-plugin install 'file:///C:/users/downloads/kbn-authentication-plugin.zip'
```

Default username and password is: 'username' and 'password' for the file storage.

To add a new user run the adduser utility, not supported in LDAP mode.
```
node adduser.js USERNAME PASSWORD
```

Make sure to set the correct version in json.config. The version must match the version of Kibana being used.

#### Features
- two factor authentication with [time based tokens](https://en.wikipedia.org/wiki/Time-based_One-time_Password_Algorithm).
- supports scanning a barcode in the [Google Authenticator](https://www.google.se/search?q=Google+authenticator) app for example.
- supports storing user credentials and keys in a simple json file.
- supports storing user credentials and keys in [MongoDB](https://www.mongodb.com/).
- supports storing user credentials in [LDAP](https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol) and keys in a json file.
- json web token authentication using Kibanas bundled HAPI package.
- uses the latest password hashing contest winner!
  - See: [Argon2](https://password-hashing.net/)

##### Troubleshooting
If the Kibana instance is already running it may be set to reload all plugins on change, if not then try restarting the instance. The authentication plugin is tested working with Kibana version 5.6.2.

If you have issues installing the plugin,
- make sure that the version in package.json is matching your kibana version.
- make sure to build with --arch=ia32 as kibana ships with a bundled x86 nodejs for windows.


##### Known issues
Multi-user capabilities is not completed, all authenticated users share the same indice and dashboards.
No plans on implementing this for now.
