var troll = require('trollbridge');
var config = require('super-config');
var _ = require('underscore');
module.exports = function(app) {
    var baseUrl = config.get('corporeal.admin.baseUrl', '/corporeal-admin');

    //app.get(baseUrl + '/dashboard', troll.shallNotPass('view_projects'), dashboard.home);


    var login = require('../controllers/login');
        app.get(baseUrl + '/login', _.bind(login.login, login));
        app.post(baseUrl + '/login/post', _.bind(login.loginWithPost, login));
        app.get(baseUrl + '/login/google', _.bind(login.loginWithGoogle, login));
        app.get(baseUrl + '/login/google/return', _.bind(login.validateGoogle, login));
        app.get(baseUrl + '/login/logout', _.bind(login.logout, login));



}
