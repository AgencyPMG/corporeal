/**
 * Bulk upload actions
 */
var Pages = require('../models/page');
var _ = require('underscore');
var config = require('super-config');
var util = require('util');
var Templates = require('../models/template');
var PagesController = require('./pages');

var BulkUploadPagesController = function() {
    //PagesController.call(this);
}

util.inherits(BulkUploadPagesController, PagesController);

BulkUploadPagesController.prototype.configure = function(req, res) {
    res.render('pages/bulkadd.html', {
        templates: this.getAllTemplates(),
        templateBaseUrl: this.getTemplateBaseUrl(req),
        page: {},
        type: 'add'
    });

}

module.exports = BulkUploadPagesController;
