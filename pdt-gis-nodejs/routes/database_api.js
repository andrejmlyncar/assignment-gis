var promise = require('bluebird');

var options = {
    promiseLib: promise
};

var pgp = require('pg-promise')(options);

var cn = {
    host: '192.168.1.111',
    port: 5432,
    database: 'open_flights',
    user: 'postgres',
    password: 'Password1'
};

var db_instance = pgp(cn);

function getAirports(req, res, next) {
    console.log("Getting all airports");
    db_instance.any('SELECT airport_id AS id, name, ST_ASGEOJSON(wkb_geometry) FROM airports')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Query successfully processed'
                });
        })
        .catch(function (err) {
            return next(err);
        });

}

function getAirportDetails(req, res, next) {
    console.log("Getting airport details");
    db_instance.one('SELECT airport_id AS id, name, city, timezone, tzdb, "iata/faa" AS iata, ST_ASGEOJSON(wkb_geometry) FROM airports WHERE airport_id = ' + req.params.airport_id)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Query successfully processed'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function getAirportRoutes(req, res, next) {
    db_instance.any('SELECT source_airport_id, st_asgeojson(r.wkb_geometry), destination_airport_id, dair.name AS destination_airport FROM routes r ' +
        'JOIN airports dair on dair.airport_id =  r.destination_airport_id where source_airport_id = ' + req.params.airport_id)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Query successfully processed'
                });
        })
        .catch(function (err) {
            return next(err);
        });
}


module.exports = {
    getAirports: getAirports,
    getAirportDetails: getAirportDetails,
    getAirportRoutes: getAirportRoutes
};