mapboxgl.accessToken = 'pk.eyJ1IjoiYW1seW5jYXIiLCJhIjoiY2l0enZ0M2k0MDA0dDNubjI0cm45dDZ6ciJ9.nHZ1ZuSLr65j2WD0cVW1ag';
console.log("Initializing map container");
var map = new mapboxgl.Map({
    container: 'map-id',
    style: 'mapbox://styles/mapbox/basic-v9',
    hash: true,
    center: [18.12, 45.79],
    zoom: 3
});
console.log("Map container initialized");
defineMapEvents();


function defineMapEvents() {
    map.on('click', function (e) {
        var features = map.queryRenderedFeatures(e.point, {layers: ['airports']});

        if (!features.length) {
            return;
        }

        var feature = features[0];

        var popup = new mapboxgl.Popup()
            .setLngLat(feature.geometry.coordinates)
            .addTo(map);
        fillAirportDetails(popup, feature);
    });

    map.on('mousemove', function (e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ['airports'] });
        map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
    });
}