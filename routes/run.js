'use strict';

// load the configurations from config.json based on the environment
var config = require('../config.json')[process.env.NODE_ENV];

// TODO: Move this db stuff to its own place.  Load config options from environment.
var mongoose = require('mongoose');
var db = mongoose.connection;
var dbPath = config.dbPath;
var Run = require('../models/run.js').Run;

db.on('error', console.error.bind(console, 'connection error'));

mongoose.connect('mongodb://' + dbPath);


exports.create = function (req, res) {

    var run = new Run(req.body);

    run.save(function (err, run) {
        if (err) {
            res.status(500).send('error saving run\n' + err);
        } else {
            res.json(run);
        }
    });
};

// This is the list that an API would use to get just JSON.
// The one we're seeing in the UI is in routes/index.js.
exports.list = function (req, res) {

    Run.find({}).sort({ date: -1 }).exec(function (err, runs) {
        if (err) {
            res.status(500).send('error loading runs\n' + err);
        } else {
            res.json(runs);
        }
    });
};

exports.update = function (req, res) {
    console.log(req.params.id);
    console.log(req.body);
    res.end('good');
    // res.status(500).send('error updating run\n' + err);
};