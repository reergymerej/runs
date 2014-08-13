// load the configurations from config.json based on the environment
var config = require('../config.json')[process.env.NODE_ENV];

/* GET home page. */
exports.index = function(req, res){
    res.render('index', {
        title: 'Runs',
        message: config.message
    });
};
