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
router.get('/api/airports/:airport_id/routes/dist=:distance', db.getAirportRoutes);
router.get('/api/routes/:route_id', db.getRouteDetails);
router.get('/api/routes/:route_id/alternatives/type=:alternativeType', db.getRouteAlternatives);
router.get('/api/countries', db.getAirportCountries);
router.get('/api/countries/:country', db.getAirportsBasedOnCountry);
router.get('/api/routes/:source/:destination', db.getAirportRoutesSearch);
module.exports = router;

function isAuthRequired(req, res, next) {
    return false;
}
