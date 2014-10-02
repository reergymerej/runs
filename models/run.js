'use strict';

var mongoose = require('mongoose');

var runSchema = mongoose.Schema({
    date: Date,
    time: String,
    distance: Number,
    rating: Number,
    weight: Number,
    vertical: Number
});

var Run;

/**
* Get the top/bottom result by sorting of a field.
* @param {String} field
* @param {Number} sortValue
* @param {Function} done
* @return {Object} The documents returned are plain javascript objects, not mongoose documents (since any shape of document can be returned).
*/
var getFieldBySort = function (field, sortValue, done) {
    var sortData = {};
    sortData[field] = sortValue;

   
    this.aggregate(
        [
            // sort by field
            { $sort: sortData },

            // limit
            { $limit: 1 }
        ],
        done
    );
};

runSchema.statics.getTopX = function (x, callback) {
    return getFieldBySort.apply(this, [x, -1, callback]);
};

runSchema.statics.getBottomX = function (x, callback) {
    return getFieldBySort.apply(this, [x, 1, callback]);
};

runSchema.statics.getFieldBySort = getFieldBySort;

Run = mongoose.model('Run', runSchema);

exports.Run = Run;