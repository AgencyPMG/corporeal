/*
 * User Model
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var User = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: true,
        index: { unique: true },
    },
    password: {
        type: String,
        required: true,
    },
    usertype: {
        type: Number,
        default: 1
    },
    userrole: {
        type: Number,
        default: 1
    },
    name: {
        type: String,
        default: '',
        trim:true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
});

/*
 * Called before the "save" method to encrypt the password
 * @since 0.0.1
 */
User.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    //first parameter is WALK_WORK_FACTOR
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        // hash the password along with our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});


User.statics = {

    /*
     * The type of user, used to decide if it is
     * from a source like Google Auth or needs a username/password
     */
    USERTYPE: {
        INTERNAL: 1,
        EXTERNAL: 2
    }

    /*
     * User roles to dictate privileges needed
     * @since 0.0.1
     */
    , USERROLES: {
        ADMIN: 4,
        PUBLISHER: 3,
        AUTHOR: 2,
        VIEWER: 1
    }

    /*
     * This function is used when using Google Authentication
     * It will add a new user without a username/password
     */
    , forceLoginUser: function(email, password, name, done) {
        var userModal = this;

         //look for a user
         this.findByEmail(email, function(error, user) {
            if (error) {
                var u = new userModal({
                    email:email,
                    name: name,
                    password: password
                });
                u.save(done);
                return;
            }
            done(error, user);
         });
    }

    /*
     * Used to find a user by email address
     */
    , findByEmail: function(emailAddress, done) {
        this.findOne({email:emailAddress}, function(error, user) {
            if (error || typeof user === 'undefined' || user == null) {
                done(error || 'No User Found');
                return;
            }
            done(error, user);
        });
    }

    /*
     * Used to find a user by email address and password
     * You can use this function to validate a user
     */
    , findByEmailAndPassword: function(emailAddress, password, done) {
        var UserClass = this;
        this.findByEmail(emailAddress, function(error, user) {
            if (error || user.usertype != UserClass.USERTYPE.INTERNAL) {
                return done(error || 'User is not an internal user and does not have a password');
            }
            user.comparePassword(password, function(error, isMatch) {
                if (error || !isMatch) {
                    return done(error || 'No match found for username and password');
                }
                return done(null, user);
            });
        });
    }
}

User.methods = {
    /*
     * Compares a password with another password
     * You can use this function to validate a user
     */
    comparePassword: function(candidatePassword, cb) {
        bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
            if (err) return cb(err);
            cb(null, isMatch);
        });
    }
};

module.exports = mongoose.model('User', User);
