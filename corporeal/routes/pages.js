/**
 * Pages Routes
 */

var troll = require('trollbridge');
var _ = require('underscore');
var PagesController = require('../controllers/pages');
var PageServeController = require('../controllers/pageserve');
var BulkUploadController = require('../controllers/pages-bulkupload');

module.exports = function(app, baseUrl) {

    //this is where we setup all the pages
    var pages = new PagesController();
        app.get(baseUrl + '/pages/list', troll.shallNotPass('list_pages'), _.bind(pages.getAllPages, pages));
        app.get(baseUrl + '/pages/add', troll.shallNotPass('add_pages'), _.bind(pages.addPage, pages));
        app.post(baseUrl + '/pages/save', troll.shallNotPass('add_pages'), _.bind(pages.savePage, pages));
        app.get(baseUrl + '/pages/edit/:pageid', troll.shallNotPass('edit_pages'), _.bind(pages.editPage, pages));
        app.post(baseUrl + '/pages/edit/save', troll.shallNotPass('edit_pages'), _.bind(pages.savePageEdit, pages));
        app.get(baseUrl + '/pages/delete/:pageid', troll.shallNotPass('page_delete'), _.bind(pages.deletePage, pages));

    var bulkupload = new BulkUploadController();
        app.get(baseUrl + '/pages/bulkadd', troll.shallNotPass('add_pages'), _.bind(bulkupload.configure, bulkupload));


    var pageserve = new PageServeController();
    pageserve.checkPagesBasedOnUrl(app);

}
