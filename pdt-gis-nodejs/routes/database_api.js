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

function getRouteAlternatives(req, res, next) {
    var alternativeType = req.params.alternativeType;
    var query;
    if (alternativeType == "source") {
        console.log("Searching for source alternatives");
        query = "SELECT id, st_asgeojson(r.wkb_geometry) FROM routes r " +
            "JOIN airports alt ON r.destination_airport_id = alt.airport_id " +
            "WHERE r.source_airport_id = (SELECT source_airport_id from routes Where id = " + req.params.route_id + ") " +
            "AND ST_DISTANCE(alt.wkb_geometry::geography, (SELECT d.wkb_geometry::geography FROM airports d WHERE d.airport_id = " +
            "(SELECT destination_airport_id from routes WHERE id = " + req.params.route_id + ")))<200000" +
            "AND id != " + req.params.route_id;
    } else if (alternativeType == "destination") {
        query = "SELECT id, st_asgeojson(r.wkb_geometry) FROM routes r " +
            "JOIN airports alt ON r.source_airport_id = alt.airport_id " +
            "WHERE r.destination_airport_id = (SELECT destination_airport_id from routes Where id = " + req.params.route_id + ")" +
            "AND ST_DISTANCE(alt.wkb_geometry::geography, (SELECT d.wkb_geometry::geography FROM airports d WHERE d.airport_id = " +
            "(SELECT source_airport_id from routes Where id = " + req.params.route_id + ")))<200000 " +
            "AND id != " + req.params.route_id;
    } else if (alternativeType == "combined") {
        query = "SELECT id, st_asgeojson(r.wkb_geometry) FROM routes r " +
            "JOIN airports dalt ON r.destination_airport_id = dalt.airport_id " +
            "JOIN airports salt ON r.source_airport_id = salt.airport_id " +
            "AND ST_DISTANCE(salt.wkb_geometry::geography, " +
            "(SELECT d.wkb_geometry::geography FROM airports d WHERE d.airport_id = (SELECT source_airport_id from routes Where id = " + req.params.route_id + ")))<200000 " +
            "AND ST_DISTANCE(dalt.wkb_geometry::geography, " +
            "(SELECT d.wkb_geometry::geography FROM airports d WHERE d.airport_id = (SELECT destination_airport_id from routes Where id = " + req.params.route_id + ")))<200000" +
            "AND id != " + req.params.route_id;
    } else {
        return next("Error: Invalid")
    }

    db_instance.any(query)
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

function getAirportCountries(req, res, next) {
    db_instance.any("SELECT DISTINCT country from airports order by country")
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

function getAirportsBasedOnCountry(req, res, next) {
    db_instance.any("SELECT airport_id, name || '-' || city as airport from airports WHERE country = '" + req.params.country + "' order by airport")
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

function getAirportRoutesSearch(req, res, next) {
    db_instance.any("SELECT id, ST_ASGEOJSON(wkb_geometry) from routes where destination_airport_id = " + req.params.destination + " AND source_airport_id = " + req.params.source)
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
    getRouteDetails: getRouteDetails,
    getRouteAlternatives: getRouteAlternatives,
    getAirportCountries: getAirportCountries,
    getAirportsBasedOnCountry: getAirportsBasedOnCountry,
    getAirportRoutesSearch: getAirportRoutesSearch
};