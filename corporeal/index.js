/**
 * The corporeal start
 */

var config = require('simple-config');
var Setup = require('./setup');;

var Corporeal = function() {
    config.loadConfig([
        __dirname + '/config/config'
    ]);
}

/**
 * Starts the corporeal process
 * @param app {Express} an express instance
 * @return {void}
 */
Corporeal.prototype.start = function(app) {
    var adminUrl = config.get('admin.baseUrl', '/corporeal');

    var setupProcessor = new Setup(app);
    setupProcessor.run();
}

/**
 * Gets the corporeal config file
 * @return {simple-config}
 */
Corporeal.prototype.getConfig = function() {
    return config;
}

module.exports = new Corporeal();
