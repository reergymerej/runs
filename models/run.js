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

    // Getting the time averages are a little trickier.
    .then(function () {
        return that.aggregate([
            // find only those with minutes & seconds
            {
                $match: {
                    minutes: { $exists: true, $gt: 0 },
                    seconds: { $exists: true }
                }
            },

            // sum each field
            {
                $group: {
                    _id: null,
                    minutes: {
                        $sum: '$minutes'
                    },
                    seconds: {
                        $sum: '$seconds'
                    },
                    count: {
                        $sum: 1
                    }
                }
            }
        ], function (err, agg) {
            // Agg has the sums of minutes and seconds.
            // [ { _id: null, minutes: 146, seconds: 12, count: 6 } ]
            console.log('agg', agg);
            // At this point, we can handle the average calculation
            // and split it up into minutes and seconds.

            // TODO: Not sure how to handle the min/mix times yet.  :(  Too tired.
        });
    })

    .then(function () {
        done(null, stats);
    });
};


Run = mongoose.model('Run', runSchema);

exports.Run = Run;