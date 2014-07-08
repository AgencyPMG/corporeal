/*
 * Contains all the login information
 * @since 0.0.1
 * @author Chris Alvares <chris.alvares@pmg.co>
 */
var passport = require('passport');
var GoogleStrategy = require('passport-google').Strategy;
var _ = require('underscore');
var config = require('super-config');
var User = require('../models/user');

var LoginController = function()
{
    this.googleStrategy = null;
}

LoginController.prototype.login = function(req, res)
{
    res.render('login/index.html');
}

LoginController.prototype.logout = function(req, res)
{
    req.logout();
    res.redirect('/login');
}

LoginController.prototype.loginWithPost = function(req, res) {
    User.findByEmailAndPassword(req.param('username', ''), req.param('password', '****'), function(error, user) {
        if (error) {
            req.session.error = error;
            res.redirect(res.locals.baseUrl + '/login');
        }
        req.user = user;
        try { req.session.passport.user = user;} catch(e){console.log(e)};
        res.redirect(res.locals.baseUrl + '/dashboard');
    });
}

LoginController.prototype.loginWithGoogle = function(req, res) {
    this.useGoogleStrategy(req, res);
    return passport.authenticate('google')(req, res);
}

LoginController.prototype.loginWithUserCreds = function(req, res) {
    //@todo implement this
}

LoginController.prototype.validateGoogle = function(req, res, next) {
    this.useGoogleStrategy(req, res);
    return passport.authenticate('google', { successRedirect: res.locals.baseUrl + '/dashboard',
                                    failureRedirect: res.locals.baseUrl+ '/login?error=bad_login' })(req, res, next);
}

/*
 * Starts a new Google Strategy
 * @since 0.0.1
 */
LoginController.prototype.useGoogleStrategy = function(req, res)
{
    if (this.googleStrategy == null) {
        this.googleStrategy = new GoogleStrategy({
            returnURL: req.protocol + "://" + req.get('host') + res.locals.baseUrl+ '/login/google/return',
            realm: req.protocol + "://" + req.get('host') + '/'
        }, _.bind(this.emailWasFound, this));

        passport.use(this.googleStrategy);
    }
}

/*
 * Used for a google strategy to confirm and email address
 * @since 0.0.1
 */
LoginController.prototype.emailWasFound = function(identifer, profile, done) {
    //make sure it is a whitelisted domain
    var controller = this;
    console.log('test',config.get('corporeal'));
    var email = _.find(profile.emails, function(email) {
        if (controller.emailIsWhitelisted(email.value, config.get('corporeal.whitelistedGoogleAppDomains'))) {
            return true;
        }
        return false;
    });

    if (typeof email === 'undefined') {
        done('Invalid Email Address, it probably means you shouldn\'t be accessing this site');
        return;
    }

    //insert the user or update their identifer
    User.forceLoginUser(email.value, identifer, email.value, done);
}

/*
 * Used to make sure a google strategy email is whitelisted
 */
LoginController.prototype.emailIsWhitelisted = function(email, domainList)
{
    return (typeof _.find(domainList, function(domain) {
        if (email.toLowerCase().indexOf('@' + domain.toLowerCase()) != -1)
            return true;
        return false;
    }) !== 'undefined');
}


module.exports = new LoginController();
