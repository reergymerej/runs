'use strict';

// These are routes for the rendered views.

// load the configurations from config.json based on the environment
var config = require('../config.json')[process.env.NODE_ENV];

var Run = require('../models/run.js').Run;

exports.index = function(req, res){
    res.render('index', {
        message: config.message,
        page: '/'
    });
};

exports.list = function (req, res) {

    Run.find({}).sort({ date: -1 }).exec(function (err, runs) {
        if (err) {
            res.status(500).send('error loading runs\n' + err);
        } else {
            res.render('list', {
                title: 'Past Runs',
                runs: runs,
                page: '/list'
            });
        }
    });
};

exports.view = function (req, res) {
    var criteria = {
        _id: req.params.id
    };

    Run.find(criteria, function (err, runs) {

        var result;

        if (err) {
            throw err;
        }

        result = runs[0];

        res.render('view', {
            run: result
        });
    });
};

exports.stats = function (req, res) {
    Run.getStats(function (err, stats) {
        if (err) {
            res.status(500).end();
        } else {
            res.render('stats', {
                stats: stats,
                page: '/stats'
            });
        }  
    });
};