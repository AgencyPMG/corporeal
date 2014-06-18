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


var Setup = function(app) {
    this.app = app;
    this.baseUrl = config.get('corporeal.admin.baseUrl', 'corporeal-admin');
}

Setup.prototype.run = function() {

    if(config.get('corporeal.debug', false)) {
        this.setupDebugInformation();
    }

    this.setupStaticFiles();
    this.setupTemplatingScheme();

    this.setupSession();
    this.setupBodyParser();

    this.setupCsrfProtection();


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

    this.app.use(this.baseUrl, function(req, res, next) {
        res.render = env.render;
    });


    env.express(this.app);
}

Setup.prototype.setupSession = function() {
    this.app.use(this.baseUrl, cookieparser(config.get('corporeal.sessionSecret', 'jg8vtg5JuYrK0VY')));
}

Setup.prototype.setupBodyParser = function() {
    this.app.use(this.baseUrl, bodyParser());
}

Setup.prototype.setupCsrfProtection = function() {
    this.app.use(this.baseUrl, csrf());
    this.app.use(this.baseUrl, function(req, res, next){
        if (!(typeof req.csrfToken === 'undefined')) {
            res.locals.csrf_token = req.csrfToken();
        }

        res.locals.req = req;
        res.locals.error = req.session.error;
        res.locals.message = req.session.message;
        //res.locals.has_permission = require('./app/lib/troll').layoutHasPermission(req);

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

    app.use(this.baseUrl, passport.initialize());
    app.use(this.baseUrl, passport.session());

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });


}

module.exports = Setup;
