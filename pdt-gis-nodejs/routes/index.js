var express = require('express');
var router = express.Router();
var app = require('../app.js');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'PDT Project Mlyncar',
        dashboard_name: 'PDT Flight App',
        auth_required: isAuthRequired(req, res, next)
    });
});

router.post('/login', function (req, res, next) {
    res.send('POST request to the homepage');
   // passport.authenticate('local-login', {
    //    failureFlash: true
   // })
});

router.get('logout', function (req, res, next) {
    res.logout();
    res.redirect('/');
});

var db = require('./database_api.js');
router.get('/api/feature1', db.getFeature1);
router.get('/api/feature2', db.getFeature2);
router.get('/api/feature3', db.getFeature3);

module.exports = router;

function isAuthRequired(req, res, next) {

    if (req.isAuthenticated()) {
        return false;
    }
    return false;
}
