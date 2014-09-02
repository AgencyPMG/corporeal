/*
 * User Controller to add/edit users
 */


var User = require('../models/user');
var troll = require('trollbridge');
var config = require('super-config');
var _ = require('underscore');

var UserController = function() {

}

/*
 * Renders a new add model
 * @access public
 */
UserController.prototype.add = function(req, res) {
    res.render('user/index.html', {
        userroles: User.USERROLES
    });
}

/**
 * Redirects the current user to their own edit page
 */
UserController.prototype.editRedirect = function(req, res) {
    res.redirect(res.locals.baseUrl + '/user/' + req.user._id + '/edit');
}


UserController.prototype.render = function(req, res) {
    var userid = req.param('userid');
    var params = {
        userroles: User.USERROLES
    };

    User.findById(userid, function(error, user) {
        if (error) {
            req.session.error = error;
            res.redirect(res.locals.baseUrl + '/dashboard');
            return;
        }
        params.editableUser = user;
        res.render('user/index.html', params);
    });
}

UserController.prototype.save = function(req, res) {

    var userid = req.param('userid', false) || req.user.id;
    var email = req.param('email', '');
    var password1 = req.param('password1', '');
    var password2 = req.param('password2', '');
    var userrole = req.param('userrole', false);
    var name = req.param('name', '');
    var type = req.param('type', 'edit');

    try {
        if (!email || ('add' === type && !password1)) {
            throw 'Please fill out all required fields';
        }
        if (password1 !== password2) {
            throw 'Passwords do not match';
        }
    } catch(e) {
        req.session.error = e;
        res.redirect(res.locals.baseUrl + this.getErrorRedirectUrl(type, userid));
        return;
    }
    var that = this;

    var saveUser = function(user) {
        user.email = email;
        user.name = name;
        if (password1) {
            user.password = password1;
        }

        if (troll.userHasPermission(req, 'edit_user_permissions')) {
            user.userrole = userrole;
        }

        user.save(function(error, user) {
            if (error) {
                req.session.error = error;
                res.redirect(res.locals.baseUrl + that.getErrorRedirectUrl(type, userid));
                return;
            }

            req.session.message = 'Saved successfully';
            res.redirect(res.locals.baseUrl + '/user/' + user._id + '/edit');
            return;
        });
    }

    if ('add' === type) {
        var u = new User();
        console.log(u);
        saveUser(u);
        return;
    }

    User.findById(userid, _.bind(function(error, user) {
        if (error) {
            req.session.error = error;
            res.redirect(res.locals.baseUrl + this.getErrorRedirectUrl(type, userid))
        }
        saveUser(user);
    }, this));
}

/**
 * Gets the projects the user has access to
 */
UserController.prototype.getUserProjectsFromRequest = function(req) {
    var projects = [];

    for (var index in req.body) {
        if (-1 !== index.indexOf('projects-')) {
            projects.push(req.body[index]);
        }
    }
    return projects;
}

/**
 * Find userid for propery
 */
UserController.prototype.getErrorRedirectUrl = function(type, userid) {
    return (
        'add'===type ?
        '/user/add' :
        '/user/'+userid+'/edit'
    );
}


/*
 * Lists all users
 * @since 0.0.1
 * @access public
 */
UserController.prototype.listAll = function(req, res) {
    var params = {};
    User.find(function (err, users) {
        if (err) {
            req.session.error = err;
            res.redirect(res.locals.baseUrl + '/dashboard');
            return;
        }

        params.allUsers = users;

        res.render('user/list.html', params);
    });
}

/*
 * Remove a user
 * @since 0.0.1
 * @access public
 */
UserController.prototype.deleteUser = function(req, res) {
    var params = {};

    User.findById(req.params.userid, function (err, doc) {
        if (err) {
            req.session.error = err;
            res.redirect('/user/list');
            return;
        }

        if (doc._id == req.user._id) {
            req.session.error = "Cannot delete yourself!";
            res.redirect('/user/list');
            return;

        } else {
            doc.remove(function(error) {
                if (error) {
                    req.session.error = error;
                }
                res.redirect('/user/list');
            });
        }

    });
}

module.exports = new UserController();
