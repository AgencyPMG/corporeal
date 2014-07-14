/**
 * Pages Controller
 */

var Pages = require('../models/page');
var _ = require('underscore');
var config = require('super-config');
var Templates = require('../models/template');

var PagesController = function PagesController() {

}

/**
 * Renders a list of pages
 * @access public
 * @param req {Request}
 * @param res {Response}
 */
PagesController.prototype.getAllPages = function(req, res) {
    Pages.getAllPages(function(error, pages) {
        if(error) {
            req.session.error = error;
            res.redirect(res.locals.baseUrl + '/dashboard');
            return;
        }

        res.render('pages/list.html', {
            pages: pages
        });
    });
}

/**
 * Renders a Add Page Template
 * @access public
 * @param req {Request}
 * @param res {Response}
 */
PagesController.prototype.addPage = function(req, res) {
    //get the templates
    res.render('pages/add.html', {
        templates: this.getAllTemplates(),
        templateBaseUrl: this.getTemplateBaseUrl(req),
        page: {},
        type: 'add'
    });
}

/**
 * Renders an edit page template with a page
 * @access public
 * @param req {Request}
 * @param res {Response}
 */
PagesController.prototype.editPage = function(req, res) {
    var pageid = req.param('pageid', '');
    Pages.findById(pageid, _.bind(function(error, page) {
        if(error || page == null) {
            req.session.error = error || 'Page does not exist';
            res.redirect(res.locals.baseUrl + '/pages/list');
            return;
        }

        res.render('pages/edit.html', {
            templates: this.getAllTemplates(),
            templateBaseUrl: this.getTemplateBaseUrl(req),
            page: page,
            pageOptions: page.get('templateData'),
            templateOptions: Templates.getTemplateForPage(page)
        });
    }, this));
}

/**
 * Saves a page from an edit form
 * @access public
 * @param req {Request}
 * @param res {Response}
 */
PagesController.prototype.savePageEdit = function(req, res) {
    var pageid = req.param('pageid', false);

    var name = req.param('name', '');
    var template = req.param('template', '');
    var tags = req.param('tags', '');
    if(!name || !template) {
        req.session.error = 'Please fill out all parameters';
        res.redirect(res.locals.baseUrl + '/pages/edit/' + pageid);
        return;
    }

    var options = {};
    //save all the varaibles
    for(var key in req.body) {
        if(-1 !== key.indexOf('variable.')) {
            options[key.replace(/variable\./g, '')] = req.body[key];
        }
    }

    Pages.update({_id: pageid}, {
        name: name,
        template: template,
        tags: tags,
        templateData: JSON.stringify(options)
    }, function(error) {
        if(error) {
            req.session.error = error;
        }
        req.session.message = 'Save Successful';
        res.redirect(res.locals.baseUrl + '/pages/edit/' + pageid);
    });
}

/**
 * Save page from an add form
 * @param req {Request}
 * @param res {Response}
 */
PagesController.prototype.savePage = function(req, res) {
    var name = req.param('name', '');
    var template = req.param('template', '');
    var url = req.param('url', '');
    var tags = req.param('tags', '');
    var pageid = req.param('pageid', false);

    if(!name || !template || !url) {
        req.session.error = 'Please fill out all parameters';
        res.redirect(res.locals.baseUrl + '/pages/add');
        return;
    }

    var page = new Pages({
        name: name,
        template: template,
        url: url,
        tags: tags.split(',')
    });
    if(pageid) {
        page._id = pageid;
        page.id = pageid;
    }

    page.save(function(error, newPage) {
        if(error) {
            req.session.error = error;
            res.redirect(res.locals.baseUrl + '/pages/add');
            return;
        }
        res.redirect(res.locals.baseUrl + '/pages/edit/' + newPage.id);
    });
}

/**
 * Helper method to get all the templates
 * @access private
 */
PagesController.prototype.getAllTemplates = function() {
    return config.get('corporeal.templates', []);
}

/**
 * Helper method to get the template base url
 * @access private
 */
PagesController.prototype.getTemplateBaseUrl = function(req) {
    return req.protocol + "://" + req.get('host') + config.get('corporeal.template.baseUrl');
}

module.exports = new PagesController();
