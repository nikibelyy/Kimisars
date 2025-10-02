ymaps.ready(init);

function init() {
    var myMap = new ymaps.Map("map", {
        controls: [],
    });

    ymaps.geocode("Воронеж", { results: 1 }).then(function (res) {
        var city = res.geoObjects.get(0);
        var bounds = city.properties.get('boundedBy');

        // Расширяем границы на 30% с каждой стороны для показа окрестностей
        var latDiff = (bounds[1][0] - bounds[0][0]) * 0.3;
        var lonDiff = (bounds[1][1] - bounds[0][1]) * 0.3;
        var extendedBounds = [
            [bounds[0][0] - latDiff, bounds[0][1] - lonDiff],
            [bounds[1][0] + latDiff, bounds[1][1] + lonDiff]
        ];

        myMap.setBounds(extendedBounds, { checkZoomRange: true, zoomMargin: 20 });

        // Добавляем слой пробок с дорожными событиями
        var trafficLayer = new ymaps.traffic.layer.Actual({
            infoLayerShown: true
        });
        myMap.layers.add(trafficLayer);
    });
}
