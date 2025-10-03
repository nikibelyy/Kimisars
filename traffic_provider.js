ymaps.ready(init);

function init() {
    var myMap = new ymaps.Map("map", {
        center: [51.6755, 39.2083], // центр Воронежа (примерный)
        zoom: 12,
        controls: [],
    });

    // Получаем границы города Воронеж через геокодер
    ymaps.geocode("Воронеж", { results: 1 }).then(function (res) {
        var city = res.geoObjects.get(0);
        var bounds = city.properties.get('boundedBy'); // [[southWest], [northEast]]

        // Устанавливаем границы карты, чтобы отображался только город
        myMap.setBounds(bounds, { checkZoomRange: true, zoomMargin: 20 });

        // Создаем провайдер пробок с дорожными событиями
        var actualProvider = new ymaps.traffic.provider.Actual(
            {},
            { infoLayerShown: true } // включаем дорожные события
        );

        // Добавляем провайдер на карту
        actualProvider.setMap(myMap);

        // Создаем слой дорожных событий (инфоточек)
        var infoLayer = new ymaps.traffic.InfoLayer(myMap, {
            provider: actualProvider
        });

        // Включаем слой дорожных событий
        infoLayer.setMap(myMap);
    });
}
