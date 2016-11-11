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
    var kmDistance = req.params.distance * 1000;
    db_instance.any('SELECT id, source_airport_id, st_asgeojson(r.wkb_geometry), destination_airport_id AS destination_airport FROM routes r ' +
        'JOIN airports dair on dair.airport_id =  r.destination_airport_id where source_airport_id = ' + req.params.airport_id +
        ' AND ST_DISTANCE(dair.wkb_geometry::geography, (SELECT wkb_geometry::geography FROM airports sair where sair.airport_id = ' + req.params.airport_id + '))<' + kmDistance)
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

function getRouteDetails(req, res, next) {
    db_instance.one('SELECT s.name || \'-\' ||s.city as a_from, d.name || \'-\' || d.city AS a_to, ST_Distance(s.wkb_geometry::geography, d.wkb_geometry::geography) AS distance from routes r ' +
        'JOIN airports s ON s.airport_id = r.source_airport_id ' +
        'JOIN airports d ON d.airport_id = r.destination_airport_id ' +
        'WHERE id = ' + req.params.route_id)
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
    getAirportRoutes: getAirportRoutes,
    getRouteDetails: getRouteDetails
};