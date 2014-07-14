/**
 * Although this is in the models file, the template is not a mongoose model
 * It is derived from the configuration files
 */

var config = require('super-config');

var Template = function() {
    this.templates = {};
    this.loadTemplates();
}

/**
 * Loads the templates, should only be called once
 */
Template.prototype.loadTemplates = function() {
    var templates = config.get('corporeal.templates');
    this.templates = {};

    for(var index in templates) {
        this.templates[templates[index].id] = templates[index];
    }
}

/**
 * Gets the template for a pageid
 */
Template.prototype.getTemplateForPage = function(page) {
    return this.templates[page.template];
}

Template.prototype.getAllTemplates = function() {
    return this.templates;
}

module.exports = new Template();
