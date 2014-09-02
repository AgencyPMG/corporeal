var permissions = require('../../config/permissions');
var _ = require('underscore');

module.exports = function(req, permission)
{
    if (!permission) {
        return true;
    }


    var role = 'defaults';
    try {
        role = ''+req.user.userrole;
    } catch(e) {};

    if (typeof permissions[role] === 'undefined' ||
       _.indexOf(permissions[role], permission) === -1) {
           console.log(permission);
        throw 'User does not have permission to access this feature';
    }

    return true;
}
