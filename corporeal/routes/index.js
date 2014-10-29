var troll = require('trollbridge');
var config = require('super-config');
var _ = require('underscore');

module.exports = function(app) {
    var baseUrl = config.get('corporeal.admin.baseUrl', '/corporeal-admin');

    app.get(baseUrl + '/dashboard',
        troll.shallNotPass('view_pages'),
        require('../controllers/dashboard').home
    );

    require('./login')(app, baseUrl);
    require('./pages')(app, baseUrl);
    require('./pages')(app, baseUrl);
    require('./user')(app, baseUrl);


}
