'use strict';

// load the configurations from config.json based on the environment
var config = require('../config.json')[process.env.NODE_ENV];

// Mongoose bootstrap ================================================

// TODO: Move this db stuff to its own place.  Load config options from environment.
var mongoose = require('mongoose');
var dbPath = config.dbPath;
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

exports.list = function (req, res) {
    var runs = Run.find(function (err, runs) {
        if (err) {
            throw err;
        }
        
        res.json(runs);
    });
};