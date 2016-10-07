var promise = require('bluebird');

var options = {
    promiseLib: promise
};

var pgp = require('pg-promise')(options);

var cn = {
    host: '192.168.1.106',
    port: 5432,
    database: 'natural_earth',
    user: 'postgres',
    password: 'Password1'
};

var db_instance = pgp(cn);

function getFeature1(req, res, next) {
    console.log("Executing feature1");
    db_instance.one('select *, st_asgeojson(wkb_geometry) from ne_10m_airports where abbrev=\'BTS\'')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Query1 successfully processed'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function getFeature2(req, res, next) {
    console.log("Executing feature2");
    db_instance.any('select *, st_asgeojson(wkb_geometry) from ne_10m_airports')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Query2 successfully processed'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function getFeature3(req, res, next) {
    console.log("Executing feature3");
}

module.exports = {
    getFeature1: getFeature1,
    getFeature2: getFeature2,
    getFeature3: getFeature3
};