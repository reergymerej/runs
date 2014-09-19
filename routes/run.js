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

exports.list = function (req, res) {
    var runs = Run.find(function (err, runs) {
        if (err) {
            res.status(500).send('error loading runs\n' + err);
        }
        res.json(runs);
    });
};

exports.update = function (req, res) {
    console.log(req.params.id);
    console.log(req.body);
    res.end('good');
    // res.status(500).send('error updating run\n' + err);
};