var troll = require('trollbridge');
var config = require('super-config');
var _ = require('underscore');
module.exports = function(app) {
    var baseUrl = config.get('corporeal.admin.baseUrl', '/corporeal-admin');

    app.get(baseUrl + '/dashboard',
        troll.shallNotPass('view_pages'),
        require('../controllers/dashboard').home
    );

    var login = require('../controllers/login');
        app.get(baseUrl + '/login', _.bind(login.login, login));
        app.post(baseUrl + '/login/post', _.bind(login.loginWithPost, login));
        app.get(baseUrl + '/login/google', _.bind(login.loginWithGoogle, login));
        app.get(baseUrl + '/login/google/return', _.bind(login.validateGoogle, login));
        app.get(baseUrl + '/login/logout', troll.shallNotPass(''), _.bind(login.logout, login));

    var pages = require('../controllers/pages');
        app.get(baseUrl + '/pages/list', troll.shallNotPass('list_pages'), _.bind(pages.getAllPages, pages));
        app.get(baseUrl + '/pages/add', troll.shallNotPass('add_pages'), _.bind(pages.addPage, pages));
        app.post(baseUrl + '/pages/save', troll.shallNotPass('add_pages'), _.bind(pages.savePage, pages));
        app.get(baseUrl + '/pages/edit/:pageid', troll.shallNotPass('edit_pages'), _.bind(pages.editPage, pages));
        app.post(baseUrl + '/pages/edit/save', troll.shallNotPass('edit_pages'), _.bind(pages.savePageEdit, pages));
        app.get(baseUrl + '/pages/delete/:pageid', troll.shallNotPass('page_delete'), _.bind(pages.deletePage, pages));

    require('./pages')(app);
    require('./user')(app);


}
