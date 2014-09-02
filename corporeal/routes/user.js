var troll = require('trollbridge');
var _ = require('underscore');
var config = require('super-config');

module.exports = function(app) {

    var baseUrl = config.get('corporeal.admin.baseUrl', '/corporeal-admin');
    var user = require('../controllers/user');

    var canEditUser = function(req, res, next) {
        if(req.param('userid') == req.user._id) {
            next();
            return;
        }
        if(!troll.userHasPermission(req, 'edit_user_permissions')) {
            res.send(404);
            return;
        }
        next();
    }

    app.get(baseUrl + '/user/list', troll.shallNotPass('edit_user_permissions'), _.bind(user.listAll, user));
    app.get(baseUrl + '/user/add', troll.shallNotPass('add_user'), _.bind(user.render, user));
    app.post(baseUrl + '/user/add/post', troll.shallNotPass('add_user'), _.bind(user.save, user));
    app.get(baseUrl + '/user/edit', troll.shallNotPass(''), _.bind(user.editRedirect, user));
    app.get(baseUrl + '/user/:userid/edit', canEditUser, _.bind(user.render, user));
    app.post(baseUrl + '/user/:userid/edit', canEditUser, _.bind(user.save, user));
    app.get(baseUrl + '/user/:userid/delete', troll.shallNotPass('can_delete_user'), _.bind(user.deleteUser, user));
}
