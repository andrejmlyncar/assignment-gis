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
router.get('/api/airports', db.getAirports);
router.get('/api/airports/:airport_id', db.getAirportDetails);
router.get('/api/airports/:airport_id/routes/:distance', db.getAirportRoutes);

module.exports = router;

function isAuthRequired(req, res, next) {
    return false;
}
