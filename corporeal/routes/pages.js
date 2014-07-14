var pageserve = require('../controllers/pageserve');

module.exports = function(app) {

    //this is where we setup all the pages
    pageserve.checkPagesBasedOnUrl(app);

}
