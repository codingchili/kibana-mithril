# kibana-mithril [![Build Status](https://travis-ci.org/codingchili/kibana-mithril.svg?branch=master)](https://travis-ci.org/codingchili/kibana-mithril)
A plugin that adds authentication to Kibana dashboards! [YouTube demo](https://www.youtube.com/watch?v=vvUdpPQhBjk)

| ⚠️⚠️⚠️ This plugin depends on outdated third-party dependencies with known vulnerabilities. ⚠️⚠️⚠️ |
| --- |

![key setup](https://raw.githubusercontent.com/codingchili/kibana-mithril/master/key-setup.png)

# Installing
To install the plugin use the kibana-plugin utility, example:
```console
./kibana-plugin install 'https://github.com/codingchili/kibana-mithril/releases/download/1.2.2/mithril-windows-x86_64-7.0.0-beta1.zip'
```

*Make sure that the kibana version and platform matches.*

If there are no releases for your specific version/platform combination please submit a request or build it yourself.

- Default username and password is: 'username' and 'password' for the file storage.
- Mithril 1.2.X can coexist with the free version of X-Pack (not gold/plat).
- Mithril 1.2.X supports using a basePath if rewriteBasePath is set to true. (default in 7.0.0).

To add a new user run the adduser utility, not supported in LDAP mode.
```console
node adduser.js USERNAME PASSWORD
```

### Configuration

To set where credentials are stored, change 'storage' in config.json. The supported modes are:
- "mongodb", stores users in a mongodb database.
- "ldap", stores users in an ldap directory (not supported by adduser utility.)
- "file", stores users in a .json file on disk.

Two factor authentication can be disabled by setting 'two-factor.enabled' to false.

**Defaults**
- Two factor authentication is enabled.
- The 'file' storage is used to store users.
- A secret for securing JWT tokens are generated on startup.

**File**
- "filename", indicates which file user credentials are stored in.

This needs to be configured when using LDAP with two-factor authentication since the secret keys cannot be stored in the LDAP directory.

**MongoDB**
- "url", points to a MongoDB server and collection to use.

When using mongoDB as a credentials store, 2FA secrets are also stored in the database.

Note: does not support servers that requires authentication.

**Ldap**

In `config.js` there is some sample configuration for setting up LDAP connectivity.

- "admin", an user that has privilegies to search for users/groups within the directory.
- "search", specifies how users are found within the directory.
- "url", points to an LDAP server that we are connecting to.

Make sure to set the correct version in json.config. The version must match the version of Kibana being used.
If you are using file-based authentication, make sure to remove the default user.

# Features
- two factor authentication with [time based tokens](https://en.wikipedia.org/wiki/Time-based_One-time_Password_Algorithm).
- supports scanning a barcode in the [Google Authenticator](https://www.google.se/search?q=Google+authenticator) app for example.
- supports storing user credentials and keys in a simple json file.
- supports storing user credentials and keys in [MongoDB](https://www.mongodb.com/).
- supports storing user credentials in [LDAP](https://en.wikipedia.org/wiki/Lightweight_Directory_Access_Protocol) and keys in a json file.
- json web token authentication using Kibanas bundled HAPI package.
- uses the latest password hashing contest winner!
  - See: [Argon2](https://password-hashing.net/)
- logs succeeded and failed login attempts.

### Building the plugin
To check out the sources and build the plugin do the following
```console
git clone https://github.com/codingchili/kibana-mithril
cd kibana-mithril
npm install
mocha test --recursive -u tdd
```

**To build an installable zip run the following script**
```console
# make sure to match the kibana version
./release.sh <kibana-version>
# example:
./release.sh 6.6.0
```

**This creates an installable zip in `build/dist/`.**

The script can either be executed on a windows machine with gitbash or WSL or on a linux system.
jq needs to be installed and available on the path for the script to work.

### Dependencies

- NodeJS 8.11.2+
- NPM
- MS Build tools / Unix build tools
- Python 2.7
- jq

To compile the binary module argon2-ffi build tools are requried, install with
```console
windows: 
  npm install --global --production windows-build-tools
unix:    
  sudo apt-get install build-essential libssl-dev libffi-dev python-dev
```
This installs MS build tools and python 2.7 and is required for node-gyp to work.

## Troubleshooting
If the Kibana instance is already running it may be set to reload all plugins on change, if not then try restarting the instance.

**Kibana compatibility matrix**
- 1.1.0 is compatible with 5.6.4 -> 6.3.2 (requires editing package.json version)
- 1.2.X is compatible with 6.6.1 and 7.10.1.

**If you have issues installing the plugin**,
- make sure that the version in package.json is matching your kibana version.
- make sure that the native modules are compiled with the same arch as kibanas bundled node.

## Known issues

- Multi-user capabilities is not completed, all authenticated users share the same indice and dashboards.
- A warning appears on startup stating that the N-API is experimental.
- Installable zip's needs to be built for each platform windows/linux and each Kibana version.

*Maintaining kibana plugins is hard work, the JS world is full of shifting paradigms and backwards
compatibility is seldom prioritized. Lack of documentation and quality is a constant nightmare. Due to
the heavy cost of upgrading there are few resources for adding new features. The upgrade from
Kibana 6.3.2 to 6.4.X came with a truckload of breaking changes and took a week to finish.*

# Contributing
Any contributions are welcome, new issues, pull requests, security reviews!

[![donate](https://img.shields.io/badge/donate-%CE%9ETH%20/%20%C9%83TC-ff00cc.svg?style=flat&logo=ethereum)](https://commerce.coinbase.com/checkout/673e693e-be6d-4583-9791-611da87861e3)
