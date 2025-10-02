ymaps.ready(init);

function init() {
    var myMap = new ymaps.Map("map", {
        controls: [],
        type: "yandex#map" // светлая карта
    });

    // Геокодируем Воронеж
    ymaps.geocode("Воронеж", { results: 1 }).then(function (res) {
        var city = res.geoObjects.get(0);
        var bounds = city.properties.get('boundedBy');

        // Ограничиваем только правый берег
        var leftLongitude = (bounds[0][1] + bounds[1][1]) / 2 + 0.015;
        var rightLongitude = bounds[1][1];
        var bottomLatitude = bounds[0][0];
        var topLatitude = bounds[1][0];

        var rightBankBounds = [
            [bottomLatitude, leftLongitude],
            [topLatitude, rightLongitude]
        ];

        myMap.setBounds(rightBankBounds, { checkZoomRange: true, zoomMargin: 20 });

        // Слой пробок
        var trafficLayer = new ymaps.traffic.layer.Actual({
            infoLayerShown: true // включает ДТП
        });
        myMap.layers.add(trafficLayer);

        // Автообновление пробок каждые 60 секунд
        setInterval(function() {
            trafficLayer.reload();
        }, 900000);

    }).catch(function(error){
        console.error("Ошибка геокодирования:", error);
        myMap.setCenter([51.6608, 39.3], 12);
    });
}
