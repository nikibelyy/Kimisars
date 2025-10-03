Сделай чтобы видно было только правый берег 
ymaps.ready(init);

function init() {
    // Создаем пустую карту без центра и зума, чтобы избежать "прыжков"
    var myMap = new ymaps.Map("map", {
        controls: [],
    });

    // Получаем границы города Воронеж через геокодер
    ymaps.geocode("Воронеж", { results: 1 }).then(function (res) {
        var city = res.geoObjects.get(0);
        var bounds = city.properties.get('boundedBy'); // границы города
        myMap.setBounds(bounds, { checkZoomRange: true, zoomMargin: 20 });

        // После установки границ подключаем провайдер пробок
        var actualProvider = new ymaps.traffic.provider.Actual(
            {},
            { infoLayerShown: true } // включаем дорожные события
        );
        actualProvider.setMap(myMap);
    });
}
