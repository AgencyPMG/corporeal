var User = require('../models/user');

var permissions = {};

permissions[User.USERROLES.ADMIN] = [
    'view_pages',
    'list_pages',
    'add_pages',
    'edit_pages',
    'page_delete',
    'edit_user_permissions',
    'add_user',
    'can_delete_user',
    'user_list',
    'user_edit'
];

permissions[User.USERROLES.PUBLISHER] = [
    'view_pages',
    'list_pages',
    'page_delete',
    'add_pages',
    'edit_pages',
    'user_edit'
]

permissions[User.USERROLES.AUTHOR] = [
    'view_pages',
    'list_pages',
    'edit_pages',
    'user_edit'
]

permissions['defaults'] = [
    'user_edit'
]

module.exports = permissions;
