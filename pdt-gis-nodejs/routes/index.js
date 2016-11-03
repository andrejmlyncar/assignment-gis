var express = require('express');
var router = express.Router();
var app = require('../app.js');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'PDT Project Mlyncar',
        dashboard_name: 'PDT Flight App',
        auth_required: isAuthRequired(req, res, next)
    });
});

var db = require('./database_api.js');
router.get('/api/feature1', db.getFeature1);
router.get('/api/feature2', db.getFeature2);
router.get('/api/feature3', db.getFeature3);

module.exports = router;

function isAuthRequired(req, res, next) {
    return false;
}
