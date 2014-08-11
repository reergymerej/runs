'use strict';


// Mongoose bootstrap ================================================

// TODO: Move this db stuff to its own place.  Load config options from environment.
var mongoose = require('mongoose');
// var dbPath = 'localhost/test';
var dbPath = 'dude:dude@troup.mongohq.com:10027/reergymerej';
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));

mongoose.connect('mongodb://' + dbPath);

// Schema ================================================
var runSchema = mongoose.Schema({
    date: Date,
    time: String,
    distance: Number,
    rating: Number,
    weight: Number
});

// Model ================================================
var Run = mongoose.model('Run', runSchema);



exports.create = function (req, res) {

    var run = new Run(req.body);

    run.save(function (err, run) {
        if (err) {
            throw err;
        }

        res.json(run);
    });
};
