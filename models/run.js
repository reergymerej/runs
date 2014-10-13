'use strict';

var mongoose = require('mongoose');

var runSchema = mongoose.Schema({
    date: Date,
    time: String,
    minutes: Number,
    seconds: Number,
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

/**
* {String} config.field
* {Number} config.sortOrder
* {String/Number} [config.$gt]
* {Object} statHolder the result of inserted into this object
* @return {Promise}
*/
var getStat = function (config) {
    var stages = [];
    var obj;

    // $match
    if (config.$gt !== undefined) {
        obj = {
            $match: {}
        };
        obj.$match[config.field] = { $gt: config.$gt };
        stages.push(obj);
    }

    // $sort
    obj = { $sort: {} };
    obj.$sort[config.field] = config.sortOrder;
    stages.push(obj);

    // $limit
    stages.push({ $limit: 1 });

    return this.aggregate(stages, function (err, run) {
        config.statHolder[config.field] = config.statHolder[config.field] || {};
        if (!err) {
            config.statHolder[config.field][config.sortOrder === 1 ? 'bottom' : 'top'] = run[0];
        }
    });
};

/**
* @param {String} field
* {Object} statHolder the result of inserted into this object
* @return {Promise}
*/
var getAverage = function (field, statHolder) {
    return this.aggregate([{
        $group: {
            _id: null,
            average: { $avg: '$' + field }
        }
    }], function (err, result) {
        if (!err) {
            statHolder[field] = statHolder[field] || {};
            statHolder[field].average = result[0].average;
        }
    });
};

runSchema.statics.getStats = function (done) {
    var that = this;
    var stats = {};

    // getStat.call(this, {
    //     field: 'time',
    //     sortOrder: 1,
    //     $gt: '',
    //     statHolder: stats
    // })
    // .then(function () {
    //     return getStat.call(that, {
    //         field: 'time',
    //         sortOrder: -1,
    //         statHolder: stats
    //     });
    // })

    // distance ================================================
    getStat.call(that, {
        field: 'distance',
        sortOrder: 1,
        $gt: 0,
        statHolder: stats
    })
    .then(function () {
        return getStat.call(that, {
            field: 'distance',
            sortOrder: -1,
            statHolder: stats
        });
    })
    .then(function () {
        return getAverage.call(that, 'distance', stats);
    })

    // weight ================================================
    .then(function () {
        return getStat.call(that, {
            field: 'weight',
            sortOrder: 1,
            $gt: 0,
            statHolder: stats
        });
    })
    .then(function () {
        return getStat.call(that, {
            field: 'weight',
            sortOrder: -1,
            statHolder: stats
        });
    })
    .then(function () {
        return getAverage.call(that, 'weight', stats);
    })

    // vertical ================================================
    .then(function () {
        return getStat.call(that, {
            field: 'vertical',
            sortOrder: 1,
            $gt: 0,
            statHolder: stats
        });
    })
    .then(function () {
        return getStat.call(that, {
            field: 'vertical',
            sortOrder: -1,
            statHolder: stats
        });
    })
    .then(function () {
        return getAverage.call(that, 'vertical', stats);
    })

    // totalSeconds ================================================
    .then(function () {
        return getStat.call(that, {
            field: 'totalSeconds',
            sortOrder: 1,
            $gt: 0,
            statHolder: stats
        });
    })
    .then(function () {
        return getStat.call(that, {
            field: 'totalSeconds',
            sortOrder: -1,
            statHolder: stats
        });
    })
    .then(function () {
        return getAverage.call(that, 'totalSeconds', stats);
    })

    .then(function () {
        done(null, stats);
    });
};


Run = mongoose.model('Run', runSchema);

exports.Run = Run;