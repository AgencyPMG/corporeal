/*
 * This is a nav menu class
 */
var allMenuItems = require('../config/menuitems');
var _ = require('underscore');
var troll = require('trollbridge');

var NavMenu = function(req)
{
    this.req = req;
    this.buildMenu();
}

/**
 * Builds the nav menu
 */
NavMenu.prototype.buildMenu = function() {
    this.startIndex = 0;
    this.menuItems = [];
    _.each(allMenuItems, _.bind(function(menuItem) {
        if (this.shouldDisplayMenuItem(menuItem)) {
            this.menuItems.push(menuItem);
        }
    }, this));
}

/**
 * Decides whether to show the menu item based on permissions
 * @access public
 * @param menuItem {MenuItem}
 */
NavMenu.prototype.shouldDisplayMenuItem = function(menuItem) {
    var permissions = (typeof menuItem.permissions !== 'undefined')?menuItem.permissions:[];

    for(var index in permissions) {
        var permission = permissions[index];

        if (!troll.userHasPermission(this.req, permission)) {
            return false;
        }
    }

    return true;
}

/**
 * Template helper to iterate through nav menu items
 * @access public
 */
NavMenu.prototype.next = function() {
    if (this.menuItems.length <= this.startIndex) {
        return false;
    }
    var menuItem = this.menuItems[this.startIndex];
    this.startIndex++;
    return menuItem;
}

module.exports = NavMenu;
