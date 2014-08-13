// load the configurations from config.json based on the environment
var config = require('../config.json')[process.env.NODE_ENV];

/* GET home page. */
exports.index = function(req, res){
    res.render('index', {
        title: 'Runs',
        message: config.message
    });
};

exports.list = function (req, res) {
    var Run = require('../models/run.js').Run;
    Run.find({}, function (err, runs) {

        if (err) {
            throw err;
        }

        res.render('list', {
            title: 'Past Runs',
            runs: runs
        });
    });
};