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



var Setup = function(app) {
    this.app = app;
    this.baseUrl = config.get('corporeal.admin.baseUrl', '/corporeal-admin');
}

Setup.prototype.run = function() {

    if(config.get('corporeal.debug', false)) {
        this.setupDebugInformation();
    }

    this.setupStaticFiles();
    this.setupTemplatingScheme();

    this.setupBodyParser();
    this.setupSession();
    this.setupPassportSupport();

    this.setupCsrfProtection();

    this.setupRoutes();


}

Setup.prototype.setupDebugInformation = function() {
    this.app.use(this.baseUrl, logger('tiny'));
}

Setup.prototype.setupStaticFiles = function() {
    this.app.use(this.baseUrl, express.static(__dirname + '/public'));
}

Setup.prototype.setupTemplatingScheme = function() {
    var fileTemplateLoader = new nunjucks.FileSystemLoader(__dirname + '/views');
    var env = new nunjucks.Environment(fileTemplateLoader);
    env.express(this.app);
}

Setup.prototype.setupSession = function() {
    var secret = config.get('corporeal.sessionSecret', 'jg8vtg5JuYrK0VY');
    this.app.use(this.baseUrl, cookieparser());
  //   this.app.use(this.baseUrl, session({
  //       store: new RedisStore({
  //           host: config.get('corporeal.redis.host', '127.0.0.1'),
  //           port: config.get('corporeal.redis.port', 6379),
  //           db: 3,
  //           pass: config.get('corporeal.redis.password')
  //     }),
  //     secret: secret
  // }));
  this.app.use(this.baseUrl, session({secret: secret}));

}

Setup.prototype.setupBodyParser = function() {
    this.app.use(this.baseUrl, bodyParser());
}

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
        console.log('gpt here');
        res.locals.resetMessages = function() {
            req.session.error = null;
            req.session.message = null;
        }

        if (res.locals.error instanceof Object) {
            res.locals.error = JSON.stringify(res.locals.error);
        }
        res.locals.navmenu = [];
        next();
    });
}

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

Setup.prototype.setupRoutes = function() {
    troll.setRedirectUrl(this.baseUrl + '/login');
    troll.addStrategies(troll.PREMADESTRATEGIES.PASSPORT);
    require('./routes/admin')(this.app);
}

module.exports = Setup;
