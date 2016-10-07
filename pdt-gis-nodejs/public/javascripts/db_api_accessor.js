/**
 * Created by Andrej on 10/7/2016.
 */

function api_call_get(call_name, get_data, callback) {
    $.get("api/" + call_name, get_data, function (data) {
        if (callback !== null) {
            callback(data);
        }
    }, 'json');
}

function feature1() {
    api_call_get('feature1', null, function (data) {
        console.log(data.data.st_asgeojson);

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
            "id": "airport",
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

function parse_query_results(data, main_type, icon) {
    var result = [];
    for (var i = 0; i < data.length; i++) {
        var element = {
            type: main_type,
            properties: {title: data[i].name, icon: icon},
            geometry: JSON.parse(data[i].st_asgeojson)
        };
        result.push(element);
    }
    return result;
}

function feature2() {
    api_call_get('feature2', null, function (data) {
        console.log(data.data[0].st_asgeojson);

        map.addSource(
            "airports", {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": parse_query_results(data.data, "Feature", "airport")
                }
            }
        );

        map.addLayer({
            "id": "airports",
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