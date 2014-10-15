    'use strict';

var mongoose = require('mongoose');

var Run;

var runSchema = mongoose.Schema({
    date: Date,
    minutes: Number,
    seconds: Number,
    totalSeconds: Number,
    distance: Number,
    rating: Number,
    weight: Number,
    vertical: Number
});

var pad = function (x, length) {
    x = x + '';
    
    while (x.length < length) {
        x = '0' + x;
    }

    return x;
};

runSchema.virtual('time')
    .get(function () {
        var seconds = this.seconds;
        var minutes = this.minutes;

        seconds = seconds % 60;

        return pad(minutes, 2) + ':' + pad(seconds, 2);
    })
    .set(function (value) {
        var parts = value.split(':');
        var minutes = parseInt(parts[0], 10);
        var seconds = parseInt(parts[1], 10);

        if (isNaN(minutes)) {
            minutes = 0;
        }

        if (isNaN(seconds)) {
            seconds = 0;
        }

        this.minutes = minutes;
        this.seconds = seconds;
    });

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

var pad = function (x, length) {
    x = x + '';
    
    while (x.length < length) {
        x = '0' + x;
    }

    return x;
};

/**
* @param {Number} seconds
* @return {String} mm:ss
*/
var getTimeFromSeconds = function (seconds) {
    var minutes = '';

    if (seconds >= 60) {
        minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
    }

    return minutes + ':' + pad(seconds, 2);
};

runSchema.statics.getStats = function (done) {
    var that = this;
    var stats = {};

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
        var top = stats.totalSeconds.top;
        var bottom = stats.totalSeconds.bottom;

        top.time = getTimeFromSeconds(top.totalSeconds);
        bottom.time = getTimeFromSeconds(bottom.totalSeconds);

        stats.time = {
            top: top,
            bottom: bottom,
            average: getTimeFromSeconds(Math.round(stats.totalSeconds.average))
        };

        delete stats.totalSeconds;

        done(null, stats);
    });
};




Run = mongoose.model('Run', runSchema);

exports.Run = Run;