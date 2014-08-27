/**
 * Used to serve pages
 */
var config = require('super-config');
var util = require('util');
var _ = require('underscore');
var URL = require('url');
var Pages = require('../models/page');
var Templates = require('../models/template');


var PageServe = function() {
    this.clearCache();
    this.startPageServeTimer();
}

/**
 * Clears the cache on a 5 minute basis
 * @access private
 */
PageServe.prototype.startPageServeTimer = function() {
    setInterval(_.bind(function() {
        this.clearCache();
    }, this), config.get('corporeal.cacheTimeout', 60000));
}

/**
 * This needs to be called whenever a saved page is updated
 * @access public
 * @param page {PageModel} an optional Page to clear
 */
PageServe.prototype.clearCache = function(page) {
    if ('undefined' === typeof page) {
        this.cachedRoutes = {};
        return;
    }
    for(var index in this.cachedRoutes) {
        if (index.indexOf(page.url) !== 'undefined') {
            delete this.cachedRoutes[index];
        }
    }
}

/**
 * Checks urls to route for the pages
 * @access public
 * @param app {Application}
 */
PageServe.prototype.checkPagesBasedOnUrl = function(app) {
    var baseUrl = config.get('corporeal.template.baseUrl');
    var reg = util.format(
        '^(%s\\/)(.*)',
        baseUrl.replace(/\//g, '\\/').replace(/\./, '\\.')
    );
    app.get(new RegExp(reg), _.bind(this.findPageToServe, this));
}

/**
 * Finds pages to serve, also houses the logic to cache pages
 * @access public
 * @param req {Request}
 * @param res {Response}
 */
PageServe.prototype.findPageToServe = function(req, res) {
    var url = req.protocol + "://" + req.get('host') + req.originalUrl;
    var baseTemplateUrl = config.get('corporeal.template.baseUrl');
    var pathname = this.stripTrailingSlashFromUrl(URL.parse(url).pathname);

    if (this.cachedRoutes[pathname]) {
        this.servePage(req, res, this.cachedRoutes[pathname]);
        return;
    }

    var newUrl = pathname.replace(baseTemplateUrl + '/', '');


    Pages.findOne(
        {url: newUrl},
        _.bind(function(error, page) {
            if (error || page == null) {
                res.send(404);
                return;
            }
            //this.cachedRoutes[pathname] = page;
            this.servePage(req, res, page);
    }, this));
}

/**
 * Serves a page, here is where all the magic happens
 * @access public
 * @param req {Request}
 * @param res {Response}
 * @param page {PageModel}
 */
PageServe.prototype.servePage = function(req, res, page) {
    //serve some mother fucking pages!

    var template = Templates.getTemplateForPage(page);
    if(!template) {
        console.log('Page template was not found for url: ' + req.url);
        res.send(404);
        return;
    }

    res.locals.staticFileDir = config.get('corporeal.template.baseUrl') + '/' + template.id;


    if ('function' === typeof template.configuration) {
        template.configuration(req, res, page, function() {
            res.render(template.dirId + '/' + template.files.startPage, page.get('templateData'));
        });
    } else {
        res.render(template.dirId + '/' + template.files.startPage, page.get('templateData'));
    }
}

/**
 * Strips trailing slash from the url
 * @access private
 * @param str {String} a url with or with a trailing slash
 */
PageServe.prototype.stripTrailingSlashFromUrl = function(str) {
    if (str.substr(-1) == '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
}

module.exports = new PageServe();
