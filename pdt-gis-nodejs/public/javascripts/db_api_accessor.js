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
    apiCallGet('airports/' + airport_id + '/routes/' + distance, null, function (data) {
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
                "line-width": 1
            }
        });
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
