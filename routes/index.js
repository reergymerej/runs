'use strict';

// load the configurations from config.json based on the environment
var config = require('../config.json')[process.env.NODE_ENV];

var Run = require('../models/run.js').Run;

Run.getTopX('weight', function (err, data) {
    console.log('top weight: ', data[0].weight);
});

Run.getBottomX('time', function (err, data) {
    console.log('lowest time: ', data[0].time);
});

exports.index = function(req, res){
    res.render('index', {
        message: config.message
    });
};

exports.list = function (req, res) {

    Run.find({}).sort({ date: -1 }).exec(function (err, runs) {
        if (err) {
            res.status(500).send('error loading runs\n' + err);
        } else {
            res.render('list', {
                title: 'Past Runs',
                runs: runs
            });
        }
    });
};

exports.view = function (req, res) {
    var criteria = {
        _id: req.params.id
    };

    Run.find(criteria, function (err, runs) {

        if (err) {
            throw err;
        }

        res.render('view', {
            run: runs[0]
        });
    });
};

