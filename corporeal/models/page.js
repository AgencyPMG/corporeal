/*
 * Page Model
 */

var mongoose = require('mongoose');

var Page = new mongoose.Schema({
    url: {
        type: String,
        trim: true,
        required: true,
        index: { unique: true },
    },
    template: {
        type: String,
        trim: true,
        required: true
    },
    name: {
        type: String,
        default: 'Unnamed Page',
        trim:true
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    tags: {
        type: Array,
        default: []
    },
    templateData: {
        type: String,
        default: '{}',
        set: function(data) {
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch(e) {
                    console.log('PageModel: Data could not be converted to JSON', e);
                }
            }
            return JSON.stringify(data);
        },
        get: function(jsonString) {
            try {
                var data = JSON.parse(jsonString);
            } catch(e) {
                data = {};
            }
            return data;
        }
    }
});

Page.statics = {

    getAllPages: function(callback) {
        this.find({}, callback);
    }

}

module.exports = mongoose.model('Page', Page);
