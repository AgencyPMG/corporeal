/**
 * Bulk upload actions
 */
var _ = require('underscore');
var config = require('super-config');
var util = require('util');
var csv = require('ya-csv');
var Pages = require('../models/page');
var PagesController = require('./pages');
var PageServe = require('./pageserve');
var archiver = require('archiver');

var BulkUploadPagesController = function() {
    PagesController.call(this);
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

BulkUploadPagesController.prototype.upload = function(req, res) {
    var template = req.param('template');
    var file = req.files.pagesfile;

    if (!file || !template) {
        req.session.error = 'No File or Template was found';
        res.redirect('bulkadd');
        return;
    }

    this.parseBulkUploadFile(template, file.path, _.bind(function(error, pages) {
        if (error || !pages.length) {
            req.session.error = error || 'No Pages to add';
            return res.redirect('bulkadd');
        }
        req.session.message = 'Pages Added successfully';
        if (req.param('downloadPagesAfterCompetion')) {
            this.downloadBulkFiles(req, res, pages);
        } else {
            res.redirect('bulkadd');
        }
    }, this));
}

BulkUploadPagesController.prototype.downloadBulkFiles = function(req, res, pages) {

    res.setHeader('Content-disposition', 'attachment; filename=download.xml');
    var p = new PageServe();
    var str = '';
    for(var index in pages) {
        //get a request from the server
        var page = pages[index];
        try {
            str += p.renderPageToString(page, {
                downloadedpage: true,
                downloadedpagenumber: index,
                downloadedpagenumbertotal: pages.length
            });
            str += "\n";
        } catch(e) {
            console.log('BulkUploadPagesController', e);
        }
    }
    res.send(str);
}

/**
 * parses the bulk upload
 */
BulkUploadPagesController.prototype.parseBulkUploadFile = function(template, file, callback) {
    var reader = csv.createCsvFileReader(file, { columnsFromHeader: true });
    var error = null;
    var length = -1;
    var savedItems = 0;
    var allItemCount = 0;
    var pages = [];

    reader.addListener('data', function(data) {
        var name = data.name || 'page_' + (new Date()).getTime();
        var url = data.url || 'bulk/' + encodeURIComponent(name.replace(/ /g, '_'))
        var page = new Pages({
            name: name,
            template: template,
            url: url ,
            templateData: JSON.stringify(data)
        });
        allItemCount++;
        page.save(function(error, newPage) {
            savedItems++;
            pages.push(page);
            if (error) {
                Pages.update({url: url}, {
                    name: name,
                    template: template,
                    templateData: JSON.stringify(data)
                }, function(err) {
                    if (err) {
                        console.log('Error: could not upload page', error);
                    } else {
                        console.log('page updated');
                    }
                });
            }
            if (savedItems === length) {
                callback(null, pages);
            }

        });
    });
    reader.addListener('error', callback);
    reader.addListener('end', function() {
        length = allItemCount;
        if (savedItems === length) {
            callback(null, pages);
        }
    });
}

module.exports = BulkUploadPagesController;
