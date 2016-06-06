# kbn-authentication-plugin [![Build Status](https://travis-ci.org/codingchili/kbn-authentication-plugin.svg?branch=master)](https://travis-ci.org/codingchili/kbn-authentication-plugin)
Plugin provides authentication through LDAP with 2-factor OTP authentication.

To install on a Kibana dashboard instance, move to kibana/installedPlugins/
```
git clone https://github.com/codingchili/kbn-authentication-plugin
cd kbn-authentication-plugin
mocha test/
```

If the Kibana instance is already running it may be set to reload all plugins on change, if not then try restarting the instance. The authentication plugin is tested working with Kibana version 5.0.0-alpha1.

The plugin is not ready for release yet, currently working with two-factor (TOTP RFC 6238, using QR for distribution) and LDAP authentication. All routes are protected by authentication by default. 

Multi-user capabilities is not yet working fully, all authenticated users share the same indice and dashboards. Multi-user capabilities is implemented by overriding all the routing present in kibana through a proxy, it is a tedious and fail-prone mission. As such access restriction to only allow access to the proxy server is pointless at this stage, users may as well authenticate directly with the Kibana instance.
