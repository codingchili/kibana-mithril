/**
 * @author Robin Duda
 *
 * Simple configuration loader, loads the file from disk
 * on inclusion.
 */

const fs = require('fs');

const config = JSON.parse(
    fs.readFileSync(
        require('path').resolve(__dirname, '../config.json'), 'utf-8'));

module.exports = {

    /**
     * Returns the configuration for a given section.
     *
     * @param name the section to be returned from the config file..
     */
    load: function (name) {
        return config[name];
    },

    /**
     * @return the configuration object.
     */
    get: () => config
};
