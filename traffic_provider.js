ymaps.ready(init);

function init() {
    // Создаем карту с резервным центром и тёмной темой
    var myMap = new ymaps.Map("map", {
        center: [51.6608, 39.2003], // Воронеж
        zoom: 11,
        controls: [],
        type: "yandex#darkMap"
    });

    // Добавляем слой пробок с дорожными событиями (ДТП, ремонт и др.)
    var trafficLayer = new ymaps.traffic.layer.Actual({
        infoLayerShown: true // включает дорожные события
    });
    myMap.layers.add(trafficLayer);

    // Автообновление пробок каждые 1 минуту для актуальности
    setInterval(function() {
        trafficLayer.reload();
    }, 60000);

    // Геокодируем Воронеж для расширенного охвата
    ymaps.geocode("Воронеж", { results: 1 }).then(function(res) {
        var city = res.geoObjects.get(0);
        if (city) {
            var bounds = city.properties.get('boundedBy');

            // Расширяем границы на 40% для показа окрестностей и трасс
            var latDiff = (bounds[1][0] - bounds[0][0]) * 0.4;
            var lonDiff = (bounds[1][1] - bounds[0][1]) * 0.4;
            var extendedBounds = [
                [bounds[0][0] - latDiff, bounds[0][1] - lonDiff],
                [bounds[1][0] + latDiff, bounds[1][1] + lonDiff]
            ];

            myMap.setBounds(extendedBounds, { checkZoomRange: true, zoomMargin: 20 });
        }
    }).catch(function(error){
        console.error("Ошибка геокодирования:", error);
        // В случае ошибки оставляем резервный центр
        myMap.setCenter([51.6608, 39.2003], 11);
    });
}
