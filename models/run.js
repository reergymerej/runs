'use strict';

var mongoose = require('mongoose');

var runSchema = mongoose.Schema({
    date: Date,
    time: String,
    distance: Number,
    rating: Number,
    weight: Number
});

var Run = mongoose.model('Run', runSchema);

exports.Run = Run;