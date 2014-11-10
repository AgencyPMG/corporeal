/**
 * Sets up the corporeal environment class
 */

var config = require('super-config');
var express = require('express');
var logger = require('morgan');
var nunjucks = require('nunjucks');
var cookieparser = require('cookie-parser');
var csrf = require('csurf');
var bodyParser = require('body-parser');
var passport = require('passport');
var troll = require('trollbridge');
var _ = require('underscore');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var NavMenu = require('./routes/navmenu');
var path = require('path');
var multer  = require('multer')

var Setup = function(app) {
    this.app = app;
    this.baseUrl = config.get('corporeal.admin.baseUrl', '/corporeal-admin');
}

/**
 * Runs the setup of the server
 */
Setup.prototype.run = function() {

    if(config.get('corporeal.debug', false)) {
        this.setupDebugInformation();
    }

    this.setupStaticFiles();
    this.setupTemplatingScheme();

    this.setupBodyParser();
    this.setupSession();
    this.setupPassportSupport();

    this.setupGlobalTemplateVariables();
    this.setupCsrfProtection();
    this.setupRoutes();


}

/**
 * sets up debug information
 */
Setup.prototype.setupDebugInformation = function() {
    this.app.use(this.baseUrl, logger('tiny'));
}

/**
 * Sets up static files for all the templates and corporeal
 */
Setup.prototype.setupStaticFiles = function() {
    this.app.use(this.baseUrl, express.static(__dirname + '/public'));
    this.app.use(config.get('corporeal.uploads.baseUrl'), express.static(config.get('corporeal.uploads.dir', __dirname + '/uploads')));
    var templateBaseUrl = config.get('corporeal.template.baseUrl');

    var templates = config.get('corporeal.templates', []);
    for(var index in templates) {
        try {
            var staticFiles = templates[index].files.staticFiles;
            if (!staticFiles) {
                this.app.use(
                    templateBaseUrl + '/' + templates[index].id,
                    express.static(staticFiles)
                );
                console.log(templateBaseUrl + '/' + templates[index].id);
            }
        } catch(e) {
            console.log('Corporeal: Template static files could not be loaded: ', e);
        }
    }
}

/**
 * Sets up the templating scheme, which defaults to nunjucks
 * also sets the dirId for the template which is used when rendering pages
 */
Setup.prototype.setupTemplatingScheme = function() {
    //find all the tempalte directories
    var fileSystemViews = [__dirname + '/views'];
    var templates = config.get('corporeal.templates', []);
    for(var index in templates) {
        var template = templates[index];
        try {
            fileSystemViews.push(path.join(template.files.baseTemplateDirectory, '..'));
            template.dirId = path.basename(template.files.baseTemplateDirectory);
        } catch(e) {
            console.log('Template unable to be loaded: ' + template.id, e);
        }
    }
    fileSystemViews = _.uniq(fileSystemViews);

    var fileTemplateLoader = new nunjucks.FileSystemLoader(fileSystemViews);
    var env = new nunjucks.Environment(fileTemplateLoader);
    this.app.set('nunjucks-env', env);
    env.express(this.app);
}

/**
 * Sets up the session
 */
Setup.prototype.setupSession = function() {
    var secret = config.get('corporeal.sessionSecret', 'jg8vtg5JuYrK0VY');
    this.app.use(this.baseUrl, cookieparser());
    this.app.use(this.baseUrl, session({
        store: new RedisStore({
            host: config.get('corporeal.redis.host', '127.0.0.1'),
            port: config.get('corporeal.redis.port', 6379),
            db: 3,
            pass: config.get('corporeal.redis.password')
      }),
      secret: secret
  }));
  this.app.use(this.baseUrl, session({secret: secret}));

}

/**
 * Sets up the current body parser
 */
Setup.prototype.setupBodyParser = function() {
    this.app.use(this.baseUrl, bodyParser());
    this.app.use(this.baseUrl, multer({ dest: config.get('corporeal.uploads.dir', __dirname + '/uploads')}));
}

/**
 * Sets up csrf protection for POST requests
 */
Setup.prototype.setupCsrfProtection = function() {
    var that = this;
    //this.app.use(this.baseUrl, csrf()); we are disbaling for now, will add back in when it goes live
    this.app.use(this.baseUrl, function(req, res, next){
        if (!(typeof req.csrfToken === 'undefined')) {
            res.locals.csrf_token = req.csrfToken();
        }

        res.locals.req = req;
        res.locals.error = req.session.error;
        res.locals.message = req.session.message;
        res.locals.baseUrl = that.baseUrl;
        res.locals.has_permission = troll.layoutHasPermission(req);
        res.locals.resetMessages = function() {
            req.session.error = null;
            req.session.message = null;
        }

        if (res.locals.error instanceof Object) {
            res.locals.error = JSON.stringify(res.locals.error);
        }
        res.locals.navmenu = new NavMenu(req);
        next();
    });
}

/**
 * Setups up the global variables that are used site wide
 */
Setup.prototype.setupGlobalTemplateVariables = function() {
    this.app.use(this.baseUrl, function(req, res, next) {
        res.locals.whitelabel_name = config.get('corporeal.whitelabel.name', 'Corporeal');
        next();
    });
}

/**
 * Sets up passport for client login
 */
Setup.prototype.setupPassportSupport = function() {

    this.app.use(this.baseUrl, passport.initialize());
    this.app.use(this.baseUrl, passport.session());

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });
}

/**
 * Starts the route setup process
 */
Setup.prototype.setupRoutes = function() {
    troll.setRedirectUrl(this.baseUrl + '/login');
    troll.addStrategies([
        troll.PREMADESTRATEGIES.PASSPORT,
        require('./troll/strategies/permissions')
    ]);
    require('./routes')(this.app);
}

module.exports = Setup;
