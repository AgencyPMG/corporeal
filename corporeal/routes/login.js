/**
 * Login Routes
 */
var _ = require('underscore');
var troll = require('trollbridge');
var LoginController = require('../controllers/login');

module.exports = function(app, baseUrl) {
    var login = new LoginController();
        app.get(baseUrl + '/login', _.bind(login.login, login));
        app.post(baseUrl + '/login/post', _.bind(login.loginWithPost, login));
        app.get(baseUrl + '/login/google', _.bind(login.loginWithGoogle, login));
        app.get(baseUrl + '/login/google/return', _.bind(login.validateGoogle, login));
        app.get(baseUrl + '/login/logout', troll.shallNotPass(''), _.bind(login.logout, login));

}
