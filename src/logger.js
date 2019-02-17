/**
 * @author Robin Duda
 *
 * Simple configuration loader, loads the file from disk
 * on inclusion.
 */

const config = require('./config');

const ERROR = 'error';
const WARNING = 'warning';
const INFO = 'info';

let plugin = config.pluginName();
let version = config.pluginVersion();
let writer;

module.exports = {
    /**
     * An implementation of a log writer, must have a 'log' method.
     */
    writer: (logger) => {
        writer = logger;
    },

    /**
    * @param line the text to log.
    * @param level optional - severity of the event, [warning, info, error]
    */
    log: (line, level) => {
        level = level || 'info';
        writer.log([level, `plugin:${plugin}@${version}`], line);
    },

    /**
     * Call when the plugin has started.
     */
    started: () => {
        log('authentication plugin enabled.');
    },

    /**
     * Call when an authentication attempt has been  made.
     */
    succeededAuthentication: (user, source) => {
        log(`authentication succeeded for user ${user} from ${ip(source)}`);
    },

    /**
     * Call when an authentication attempt has been  made.
     */
    failedAuthentication: (user, source) => {
        log(`authentication failed for user ${user} from ${ip(source)}`, WARNING);
    },

    /**
     * Call when 2FA verification has succeeded.
     */
    succeeded2FA: (user, source) => {
        log(`2FA verification succeeded for user ${user} from ${ip(source)}`);
    },

     /**
     * Call when two-factor verification has failed.
     */
    failed2FA: (user, source) => {
        log(`2FA verification failed for user ${user} from ${ip(source)}`, WARNING);
    },

    /**
     * Call when a request is blocked because of missing authorization.
     */
    unauthorized: (path, source) => {
        log(`blocked unauthorized access to ${path} from ${ip(source)}`);
    },

    /**
    * Call when a new HMAC key is generated.
    */
    generatedSecret: () => {
        log(`generated random secret for signing tokens.`);
    }
};

function ip(source) {
    return source.forwarded ?
        `[${source.forwaraded}, ${source.ip}]` :
        `[${source.ip}]`;
}

function log(line, level) {
    module.exports.log(line, level);
}