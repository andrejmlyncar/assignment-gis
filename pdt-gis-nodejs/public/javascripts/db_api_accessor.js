/**
 * Created by Andrej on 10/7/2016.
 */

var spawnedLayers = [];
function apiCallGet(call_name, get_data, callback) {
    $.get("api/" + call_name, get_data, function (data) {
        if (callback !== null) {
            callback(data);
        }
    }, 'json');
}

function getAirports() {
    apiCallGet('airports', null, function (data) {
        var layerId = 'airports';
        updateLayerStack(layerId);
        map.addSource(
            "airports", {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": parseQueryResults(data.data, "Feature", "airport")
                }
            }
        );

        map.addLayer({
            "id": layerId,
            "type": "symbol",
            "source": "airports",
            "layout": {
                "icon-image": "{icon}-15",
                "text-field": "{title}",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0.6],
                "text-anchor": "top",
                "text-size": 12
            }
        });
    });
}

function fillAirportDetails(popup, featureData) {
    apiCallGet('airports/' + featureData.properties.id, null, function (data) {
        var description = "<h5> Airport Details of <strong>" + data.data.name + "</strong></h5>" +
            "<p>" +
            "<strong>City:</strong> " + data.data.city +
            "<br>" +
            "<strong>IATA/FAA Code:</strong> " + data.data.iata +
            "<br>" +
            "<strong>Timezone:</strong> " + data.data.timezone +
            "<br>" +
            "<strong>Daylight Savings Time:</strong> " + data.data.tzdb +
            "</p>" +
            "<button id='route-search' onclick='showRouteSearchModal(\"" + data.data.name + "\"," + data.data.id + ")' class=\"btn btn-default\">Show Route Searcher</button>";

        popup.setHTML(description);
    });
}


function findRoutesFromAirport(airport_id, distance) {
    apiCallGet('airports/' + airport_id + '/routes/dist=' + distance, null, function (data) {
        var layerId = "routes_" + airport_id;
        updateLayerStack(layerId);
        map.addSource(
            layerId, {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": parseQueryResults(data.data, "Feature", null)
                }
            }
        );

        map.addLayer({
            "id": layerId,
            "type": "line",
            "source": layerId,
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": "#ff66ff",
                "line-width": 3
            }
        });

        map.on('click', function (e) {
            var features = map.queryRenderedFeatures(e.point, {layers: [layerId]});

            if (!features.length) {
                return;
            }

            var feature = features[0];
            var popup = new mapboxgl.Popup()
                .setLngLat(map.unproject(e.point))
                .addTo(map);
            fillRouteDetails(popup, feature);
        });

        map.on('mousemove', function (e) {
            var features = map.queryRenderedFeatures(e.point, {layers: spawnedLayers});
            map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
        });
    });
}

function getAlternatives(route_id, type) {
    apiCallGet('routes/' + route_id + '/alternatives/type=' + type, null, function (data) {
        var layerId = type + "_alternatives_" + route_id;
        var lineColour = "#1166ff";
        if(type=="source") {
            lineColour= "#aa6633"
        } else if(type=="destination") {
            lineColour = "#aa4488";
        }

        updateLayerStack(layerId);
        map.addSource(
            layerId, {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": parseQueryResults(data.data, "Feature", null)
                }
            }
        );

        map.addLayer({
            "id": layerId,
            "type": "line",
            "source": layerId,
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": lineColour,
                "line-width": 3
            }
        });

        map.on('click', function (e) {
            var features = map.queryRenderedFeatures(e.point, {layers: [layerId]});

            if (!features.length) {
                return;
            }

            var feature = features[0];
            var popup = new mapboxgl.Popup()
                .setLngLat(map.unproject(e.point))
                .addTo(map);
            fillRouteDetails(popup, feature);
        });

        map.on('mousemove', function (e) {
            var features = map.queryRenderedFeatures(e.point, {layers: spawnedLayers});
            map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
        });
    });
}

function fillRouteDetails(popup, featureData) {
    apiCallGet('routes/' + featureData.properties.id, null, function (data) {
        var distance = data.data.distance / 1000;

        var description = "<h5> Route Details of Route <strong>" + featureData.properties.id + "</strong></h5>" +
            "<p>" +
            "<strong>Source:</strong> " + data.data.a_from +
            "<br>" +
            "<strong>Destination:</strong> " + data.data.a_to +
            "<br>" +
            "<strong>Distance:</strong> " + distance.toPrecision(6) + "km" +
            "<br>" +
            "<div class='text-center'>" +
            "<button id='route-search-src' onclick='getAlternatives("+featureData.properties.id + ", \"destination\")'  class=\"btn btn-info popup-button\">Source Alternatives</button> <br>" +
            "<button id='route-search-dest' onclick='getAlternatives("+ featureData.properties.id + ", \"source\")' class=\"btn btn-info popup-button\">Destination Alternatives</button> <br>" +
            "<button id='route-search-comb' onclick='getAlternatives("+ featureData.properties.id + ", \"combined\")' class=\"btn btn-info popup-button\">Combined Alternatives</button>" +
            "</div>";

        popup.setHTML(description);
    });
}

function updateLayerStack(layerId) {
    if (map.getLayer(layerId) != undefined) {
        map.removeLayer(layerId);
        map.removeSource(layerId);
    } else {
        spawnedLayers.push(layerId);
    }
}

function parseQueryResults(data, mainType, icon) {
    var result = [];
    for (var i = 0; i < data.length; i++) {
        var element = {
            type: mainType,
            properties: {title: data[i].name, icon: icon, id: data[i].id},
            geometry: JSON.parse(data[i].st_asgeojson)
        };
        result.push(element);
    }
    return result;
}

function cleanMapElements() {
    var i = spawnedLayers.length;
    while (spawnedLayers.length != 0) {
        i--;
        map.removeLayer(spawnedLayers[i]);
        map.removeSource(spawnedLayers[i]);
        spawnedLayers.splice($.inArray(spawnedLayers[i], spawnedLayers), 1);
    }
}

function showRouteSearchModal(airport_name, airport_id) {
    $('#route-search-modal').modal('show');
    $('#modal-airport-name').append(airport_name);
    $('#route-search-button').val(airport_id);
}
