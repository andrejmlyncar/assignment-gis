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

function feature1() {
    apiCallGet('feature1', null, function (data) {
        var layerId = 'airport';
        updateLayerStack(layerId);
        map.addSource(
            "airport", {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "geometry": JSON.parse(data.data.st_asgeojson),
                        "properties": {
                            "icon": "airport",
                            "title": data.data.name
                        }
                    }]
                }
            }
        );

        map.addLayer({
            "id": 'airport',
            "type": "symbol",
            "source": "airport",
            "layout": {
                "icon-image": "{icon}-15",
                "text-field": "{title}",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0.6],
                "text-anchor": "top"
            }
        });

    });
}


function feature2() {
    apiCallGet('feature2', null, function (data) {
        console.log(data.data[0].st_asgeojson);
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
                "text-anchor": "top"
            }
        });
    });

}

function updateLayerStack(layerId) {
    console.log('updating layer stack');
    if (map.getLayer(layerId) != undefined) {
        console.log('method was executed before, removing layer');
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
            properties: {title: data[i].name, icon: icon},
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