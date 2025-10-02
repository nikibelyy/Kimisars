ymaps.ready(init);

function init() {
    // Создаем карту без центра и зума
    var myMap = new ymaps.Map("map", {
        controls: [],
    });

    // Получаем границы города Воронеж через геокодер
    ymaps.geocode("Воронеж", { results: 1 }).then(function (res) {
        var city = res.geoObjects.get(0);
        var bounds = city.properties.get('boundedBy'); // границы города
        myMap.setBounds(bounds, { checkZoomRange: true, zoomMargin: 20 });

        // Создаем слой пробок (TrafficLayer) с дорожными событиями
        var trafficLayer = new ymaps.traffic.layer.Actual({
            infoLayerShown: true // включаем дорожные события
        });

        // Добавляем слой на карту
        myMap.layers.add(trafficLayer);
    });
}
